package auth

import (
	"encoding/json"
	"fmt"
	"net/http"

	"time"

	"golang.org/x/crypto/bcrypt"

	"flow/api/serde"
	"flow/common/db"
	"flow/common/util/random"
)

const verifyKeyLength = 6

const updatePasswordResetQuery = `
INSERT INTO queue.password_reset(user_id, secret_key, expiry)
VALUES ($1, $2, $3)
ON CONFLICT (user_id) DO UPDATE SET secret_key = EXCLUDED.secret_key, expiry = EXCLUDED.expiry, created_at = NOW(), seen_at = NULL
`

const selectIdQuery = `
SELECT user_id FROM secret.user_email WHERE email = $1
`

func sendEmail(tx *db.Tx, email string) error {
	var userId int
	err := tx.QueryRow(selectIdQuery, email).Scan(&userId)
	if err != nil {
		return serde.WithStatus(
			http.StatusBadRequest,
			serde.WithEnum(serde.EmailNotRegistered, fmt.Errorf("email not registered")),
		)
	}

	expiry := time.Now().Add(time.Hour)
	key, err := random.String(verifyKeyLength, random.AllLetters)
	if err != nil {
		return fmt.Errorf("generating reset key: %w", err)
	}

	_, err = tx.Exec(updatePasswordResetQuery, userId, key, expiry)
	if err != nil {
		return fmt.Errorf("writing password_reset: %w", err)
	}

	return nil
}

type sendEmailRequest struct {
	Email string `json:"email"`
}

func SendEmail(tx *db.Tx, r *http.Request) error {
	var body sendEmailRequest
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		return serde.WithStatus(http.StatusBadRequest, fmt.Errorf("malformed JSON: %w", err))
	}

	if body.Email == "" {
		return serde.WithStatus(http.StatusBadRequest, fmt.Errorf("empty email", err))
	}

	return sendEmail(tx, body.Email)
}

const selectVerifyKeyQuery = `
SELECT EXISTS(SELECT FROM queue.password_reset WHERE secret_key = $1 AND expiry > $2)
`

type verifyKeyRequest struct {
	Key string `json:"key"`
}

func VerifyKey(tx *db.Tx, r *http.Request) error {
	var body verifyKeyRequest
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		return serde.WithStatus(http.StatusBadRequest, fmt.Errorf("malformed JSON: %w", err))
	}

	if body.Key == "" {
		return serde.WithStatus(http.StatusBadRequest, fmt.Errorf("no key"))
	}

	var keyExists bool
	err = tx.QueryRow(selectVerifyKeyQuery, body.Key, time.Now()).Scan(&keyExists)
	if err != nil || !keyExists {
		return serde.WithStatus(
			http.StatusForbidden,
			serde.WithEnum(serde.InvalidResetKey, fmt.Errorf("key not found or is expired")),
		)
	}

	return nil
}

const selectExpiryQuery = `
SELECT user_id, expiry FROM queue.password_reset WHERE secret_key = $1
`

const deleteKeyQuery = `
DELETE FROM queue.password_reset WHERE secret_key = $1
`

const updateUserPasswordQuery = `
UPDATE secret.user_email SET password_hash = $1 WHERE user_id = $2
`

func resetPassword(tx *db.Tx, key, password string) error {
	var expiry time.Time
	var userId int
	err := tx.QueryRow(selectExpiryQuery, key).Scan(&userId, &expiry)
	if err != nil {
		return serde.WithStatus(
			http.StatusForbidden,
			serde.WithEnum(serde.InvalidResetKey, fmt.Errorf("key %s does not exist: %w", key, err)),
		)
	}

	if !expiry.After(time.Now()) {
		return serde.WithStatus(
			http.StatusForbidden,
			serde.WithEnum(serde.InvalidResetKey, fmt.Errorf("key expired at %v", expiry)),
		)
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), BcryptCost)
	if err != nil {
		return fmt.Errorf("hashing new password: %w", err)
	}

	_, err = tx.Exec(updateUserPasswordQuery, hash, userId)
	if err != nil {
		return fmt.Errorf("updating user_email: %w", err)
	}

	_, err = tx.Exec(deleteKeyQuery, key)
	if err != nil {
		return fmt.Errorf("deleting key: %w", err)
	}

	return nil
}

type resetPasswordRequest struct {
	Key      string `json:"key"`
	Password string `json:"password"`
}

func ResetPassword(tx *db.Tx, r *http.Request) error {
	var body resetPasswordRequest
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		return serde.WithStatus(http.StatusBadRequest, fmt.Errorf("malformed JSON: %w", err))
	}

	if body.Key == "" || body.Password == "" {
		return serde.WithStatus(http.StatusBadRequest, fmt.Errorf("no key or password"))
	}

	if len(body.Password) < MinPasswordLength {
		return serde.WithStatus(
			http.StatusBadRequest,
			serde.WithEnum(serde.PasswordTooShort, fmt.Errorf("password is too short")),
		)
	}

	return resetPassword(tx, body.Key, body.Password)
}
