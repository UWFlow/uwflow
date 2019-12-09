package auth

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"net/http"

	"time"

	"golang.org/x/crypto/bcrypt"

	"flow/api/serde"
	"flow/api/sub"
	"flow/common/state"
)

type sendEmailRequest struct {
	Email *string `json:"email"`
}

type resetPasswordRequest struct {
	Key      *string `json:"key"`
	Password *string `json:"password"`
}

// GenerateRandomBytes returns securely generated random bytes.
// It will return an error if the system's secure random
// number generator fails to function correctly, in which
// case the caller should not continue.
func GenerateRandomBytes(n int) ([]byte, error) {
	b := make([]byte, n)
	_, err := rand.Read(b)
	// Note that err == nil only if we read len(b) bytes.
	if err != nil {
		return nil, err
	}
	return b, nil
}

// GenerateRandomString returns a securely generated random string.
// It will return an error if the system's secure random
// number generator fails to function correctly, in which
// case the caller should not continue.
func GenerateRandomString(n int) (string, error) {
	const letters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
	bytes, err := GenerateRandomBytes(n)
	if err != nil {
		return "", err
	}
	for i, b := range bytes {
		bytes[i] = letters[b%byte(len(letters))]
	}
	return string(bytes), nil
}

func sendEmail(state *state.State, r *http.Request) (error, int) {
	body := sendEmailRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		return serde.WithEnum("reset_password_bad_request", fmt.Errorf("decoding send password reset email request: %v", err)), http.StatusBadRequest
	}
	if body.Email == nil {
		return serde.WithEnum("reset_password_bad_request", fmt.Errorf("decoding send password reset email request: expected email")), http.StatusBadRequest
	}

	// Check db if email exists and get corresponding user_id
	var userID int
	var join_source string
	err = state.Db.QueryRow(
		`SELECT id, join_source FROM public.user WHERE email = $1`,
		*body.Email,
	).Scan(&userID, &join_source)
	if err != nil || join_source != "email" {
		return serde.WithEnum("reset_password_email_not_found", fmt.Errorf("checking email with db: not an email user")), http.StatusBadRequest
	}

	// generate unique code which expires in 1 hour
	expiry := time.Now().Add(time.Hour)
	code, err := GenerateRandomString(6)
	if err != nil {
		return serde.WithEnum("reset_password", fmt.Errorf("generating one-time reset code: %v", err)), http.StatusInternalServerError
	}

	err = sub.SendAutomatedEmail(state, []string{*body.Email}, code, "Body")
	if err != nil {
		return serde.WithEnum("reset_password", fmt.Errorf("sending password reset email: %v", err)), http.StatusInternalServerError
	}

	// Attempt to insert generated code and userID into secret.password_reset table
	_, err = state.Db.Exec(
		`INSERT INTO secret.password_reset(user_id, verify_key, expiry) VALUES ($1, $2, $3)`,
		userID, code, expiry,
	)
	if err != nil {
		return serde.WithEnum("reset_password", fmt.Errorf("saving user one-time reset code to db: %v", err)), http.StatusInternalServerError
	}
	return nil, http.StatusOK
}

func SendEmail(state *state.State, w http.ResponseWriter, r *http.Request) {
	err, status := sendEmail(state, r)
	if err != nil {
		serde.Error(w, err, status)
	}
	w.WriteHeader(status)
}

func VerifyResetCode(state *state.State, w http.ResponseWriter, r *http.Request) {
	queryParams := r.URL.Query()
	key, ok := queryParams["key"]
	if !ok {
		serde.Error(w, serde.WithEnum("reset_password_bad_request", fmt.Errorf("verifying reset code: expected param key=KEY")), http.StatusBadRequest)
		return
	}

	// Check that key exists in secret.password_reset table
	var keyExists bool
	err := state.Db.QueryRow(
		`SELECT EXISTS(SELECT 1 FROM secret.password_reset WHERE verify_key = $1 AND expiry > $2)`,
		key[0], time.Now(),
	).Scan(&keyExists)
	if err != nil || !keyExists {
		serde.Error(w, serde.WithEnum("reset_password_invalid_code", fmt.Errorf("verifying reset code: provided key not found or is expired")), http.StatusForbidden)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func resetPassword(state *state.State, r *http.Request) (error, int) {
	body := resetPasswordRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		return serde.WithEnum("reset_password_bad_request", fmt.Errorf("decoding reset password request: %v", err)), http.StatusBadRequest
	}
	if body.Key == nil || body.Password == nil {
		return serde.WithEnum("reset_password_bad_request", fmt.Errorf("decoding reset password request: expected code, password")), http.StatusBadRequest
	}

	// Check that password reset key is valid and fetch corresponding userID and expiry
	var expiry time.Time
	var userID int
	err = state.Db.QueryRow(
		`SELECT user_id, expiry FROM secret.password_reset WHERE verify_key = $1`,
		*body.Key,
	).Scan(&userID, &expiry)
	if err != nil {
		return serde.WithEnum("reset_password_invalid_code", fmt.Errorf("checking for reset code in db: %v", err)), http.StatusForbidden
	}

	// Check that key is not expired
	if !(expiry.After(time.Now())) {
		return serde.WithEnum("reset_password_invalid_code", fmt.Errorf("checking reset code expiry: %v", err)), http.StatusForbidden
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(*body.Password), bcryptCost)
	if err != nil {
		return serde.WithEnum("reset_password", fmt.Errorf("generating new password hash: %v", err)), http.StatusInternalServerError
	}
	_, err = state.Db.Exec(
		`UPDATE secret.user_email SET password_hash = $1 WHERE user_id = $2`,
		passwordHash, userID,
	)
	if err != nil {
		return serde.WithEnum("reset_password", fmt.Errorf("inserting new user credentials: %v", err)), http.StatusInternalServerError
	}

	return nil, http.StatusOK
}

func ResetPassword(state *state.State, w http.ResponseWriter, r *http.Request) {
	err, status := resetPassword(state, r)
	if err != nil {
		serde.Error(w, err, status)
	}
	w.WriteHeader(status)
}
