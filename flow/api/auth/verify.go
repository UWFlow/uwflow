package auth

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"flow/api/serde"
	"flow/common/db"
	"flow/common/util/random"
)

const upsertEmailVerifyQuery = `
INSERT INTO queue.email_verify(user_id, secret_key, expiry)
VALUES ($1, $2, $3)
ON CONFLICT (user_id) DO UPDATE SET secret_key = EXCLUDED.secret_key, expiry = EXCLUDED.expiry, created_at = NOW(), seen_at = NULL
`

// writeVerifyCode generates a fresh verification code for the user and queues
// the verification email. The queue.email_verify INSERT trigger notifies the
// mail worker, which sends the code. Shared by register and resend.
func writeVerifyCode(tx *db.Tx, userId int) error {
	key, err := random.String(verifyKeyLength, random.AllLetters)
	if err != nil {
		return fmt.Errorf("generating verify key: %w", err)
	}

	expiry := time.Now().Add(time.Hour)
	if _, err := tx.Exec(upsertEmailVerifyQuery, userId, key, expiry); err != nil {
		return fmt.Errorf("writing email_verify: %w", err)
	}

	return nil
}

type sendVerifyEmailRequest struct {
	Email string `json:"email"`
}

// SendVerifyEmail (re)sends a verification code to a registered email. Used to
// resend on signup and when an unverified user tries to log in.
func SendVerifyEmail(tx *db.Tx, r *http.Request) error {
	var body sendVerifyEmailRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		return serde.WithStatus(http.StatusBadRequest, fmt.Errorf("malformed JSON: %w", err))
	}

	if body.Email == "" {
		return serde.WithStatus(http.StatusBadRequest, fmt.Errorf("empty email"))
	}

	var userId int
	err := tx.QueryRow(selectIdQuery, body.Email).Scan(&userId)
	if err != nil {
		return serde.WithStatus(
			http.StatusBadRequest,
			serde.WithEnum(serde.EmailNotRegistered, fmt.Errorf("email not registered")),
		)
	}

	return writeVerifyCode(tx, userId)
}

const selectVerifyCodeQuery = `
SELECT user_id, expiry FROM queue.email_verify WHERE secret_key = $1
`

const markVerifiedQuery = `
UPDATE secret.user_email SET verified = TRUE WHERE user_id = $1
`

const deleteVerifyCodeQuery = `
DELETE FROM queue.email_verify WHERE secret_key = $1
`

type verifyEmailRequest struct {
	Key string `json:"key"`
}

// VerifyEmail consumes a verification code, marks the account verified, and
// returns a signed JWT so the now-verified user is logged in.
func VerifyEmail(tx *db.Tx, r *http.Request) (interface{}, error) {
	var body verifyEmailRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("malformed JSON: %w", err))
	}

	if body.Key == "" {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("no key"))
	}

	var response authResponse
	var expiry time.Time
	err := tx.QueryRow(selectVerifyCodeQuery, body.Key).Scan(&response.UserId, &expiry)
	if err != nil {
		return nil, serde.WithStatus(
			http.StatusForbidden,
			serde.WithEnum(serde.InvalidVerifyKey, fmt.Errorf("key %s does not exist: %w", body.Key, err)),
		)
	}

	if !expiry.After(time.Now()) {
		return nil, serde.WithStatus(
			http.StatusForbidden,
			serde.WithEnum(serde.InvalidVerifyKey, fmt.Errorf("key expired at %v", expiry)),
		)
	}

	if _, err := tx.Exec(markVerifiedQuery, response.UserId); err != nil {
		return nil, fmt.Errorf("marking verified: %w", err)
	}

	if _, err := tx.Exec(deleteVerifyCodeQuery, body.Key); err != nil {
		return nil, fmt.Errorf("deleting verify code: %w", err)
	}

	response.Token, err = serde.NewSignedJwt(response.UserId)
	if err != nil {
		return nil, fmt.Errorf("signing jwt: %w", err)
	}
	response.IsNew = true

	return &response, nil
}
