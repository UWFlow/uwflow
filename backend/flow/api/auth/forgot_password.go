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

type sendEmailRequest struct {
	Email string `json:"email"`
}

type resetPasswordRequest struct {
	Key      string `json:"key"`
	Password string `json:"password"`
}

const verifyKeyLength = 6

const updatePasswordResetQuery = `
INSERT INTO secret.password_reset(user_id, verify_key, expiry)
VALUES ($1, $2, $3)
ON CONFLICT (user_id) DO UPDATE SET verify_key = EXCLUDED.verify_key, expiry = EXCLUDED.expiry
`

func SendEmail(tx *db.Tx, r *http.Request) error {
	var body sendEmailRequest
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		return serde.WithStatus(http.StatusBadRequest, fmt.Errorf("malformed JSON: %w", err))
	}
	if body.Email == "" {
		return serde.WithStatus(http.StatusBadRequest, fmt.Errorf("empty email", err))
	}

	// Check db if email exists and get corresponding user_id
	var userId int
	var joinSource string
	err = tx.QueryRow(
		`SELECT id, join_source FROM public.user WHERE email = $1`,
		body.Email,
	).Scan(&userId, &joinSource)
	if err != nil || joinSource != "email" {
		return serde.WithStatus(
			http.StatusBadRequest,
			serde.WithEnum(serde.EmailNotRegistered, fmt.Errorf("email not registered")),
		)
	}

	// generate unique key which expires in 1 hour
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

func VerifyResetCode(tx *db.Tx, r *http.Request) error {
	queryParams := r.URL.Query()
	key, ok := queryParams["key"]
	if !ok {
		return serde.WithStatus(http.StatusBadRequest, fmt.Errorf("missing param key=KEY"))
	}

	var keyExists bool
	err := tx.QueryRow(
		`SELECT EXISTS(SELECT 1 FROM secret.password_reset WHERE verify_key = $1 AND expiry > $2)`,
		key[0], time.Now(),
	).Scan(&keyExists)
	if err != nil || !keyExists {
		return serde.WithStatus(
			http.StatusForbidden,
			serde.WithEnum(serde.InvalidResetKey, fmt.Errorf("key not found or is expired")),
		)
	}
	return nil
}

func ResetPassword(tx *db.Tx, r *http.Request) error {
	var body resetPasswordRequest
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		return serde.WithStatus(http.StatusBadRequest, fmt.Errorf("malformed JSON: %w", err))
	}
	defer r.Body.Close()

	if body.Key == "" || body.Password == "" {
		return serde.WithStatus(http.StatusBadRequest, fmt.Errorf("no code or password"))
	}

	// Check that password reset key is valid and fetch corresponding userId and expiry
	var expiry time.Time
	var userId int
	err = tx.QueryRow(
		`SELECT user_id, expiry FROM secret.password_reset WHERE verify_key = $1`,
		body.Key,
	).Scan(&userId, &expiry)
	if err != nil {
		return serde.WithStatus(
			http.StatusForbidden,
			serde.WithEnum(serde.InvalidResetKey, fmt.Errorf("key %s does not exist: %w", body.Key, err)),
		)
	}

	// Check that key is not expired
	if !expiry.After(time.Now()) {
		return serde.WithStatus(
			http.StatusForbidden,
			serde.WithEnum(serde.InvalidResetKey, fmt.Errorf("key expired at %v", expiry)),
		)
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcryptCost)
	if err != nil {
		return fmt.Errorf("hasing new password: %w", err)
	}

	_, err = tx.Exec(
		`UPDATE secret.user_email SET password_hash = $1 WHERE user_id = $2`,
		hash, userId,
	)
	if err != nil {
		return fmt.Errorf("inserting new user_email: %w", err)
	}

	return nil
}
