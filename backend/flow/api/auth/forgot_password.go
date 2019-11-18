package auth

import (
	"crypto/rand"
	"encoding/json"
	"net/http"

	"github.com/AyushK1/uwflow2.0/backend/api/sub"

	"time"

	"golang.org/x/crypto/bcrypt"

	"flow/api/serde"
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

func SendEmail(state *state.State, w http.ResponseWriter, r *http.Request) {
	body := sendEmailRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		serde.Error(w, "Expected non-empty body", http.StatusBadRequest)
		return
	}
	if body.Email == nil {
		serde.Error(w, "Expected {email}", http.StatusBadRequest)
		return
	}

	// Check db if email exists and get corresponding user_id
	var userID int
	var join_source string
	err = state.Db.QueryRow(
		`SELECT id, join_source FROM public.user WHERE email = $1`,
		*body.Email,
	).Scan(&userID, &join_source)
	if err != nil || join_source != "email" {
		serde.Error(w, "Email not found", http.StatusBadRequest)
		return
	}

	// generate unique code which expires in 1 hour
	expiry := time.Now().Add(time.Hour)
	code, err := GenerateRandomString(6)
	if err != nil {
		serde.Error(w, "Failed to generate verification code", http.StatusInternalServerError)
		return
	}

	err = sub.SendAutomatedEmail(state, []string{*body.Email}, code, "Body")
	if err != nil {
		serde.Error(w, "Error sending forgot password email", http.StatusInternalServerError)
		return
	}

	// Attempt to insert generated code and userID into secret.password_reset table
	_, err = state.Db.Exec(
		`INSERT INTO secret.password_reset(user_id, verify_key, expiry) VALUES ($1, $2, $3)`,
		userID, code, expiry,
	)
	if err != nil {
		serde.Error(w, "Error writing to db", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func VerifyResetCode(state *state.State, w http.ResponseWriter, r *http.Request) {
	queryParams := r.URL.Query()
	key, ok := queryParams["key"]
	if !ok {
		serde.Error(w, "Expected param key=KEY", http.StatusBadRequest)
		return
	}

	// Check that key exists in secret.password_reset table
	var keyExists bool
	err := state.Db.QueryRow(
		`SELECT EXISTS(SELECT 1 FROM secret.password_reset WHERE verify_key = $1 AND expiry > $2)`,
		key[0], time.Now(),
	).Scan(&keyExists)
	if err != nil || !keyExists {
		serde.Error(w, "Provided key not found or is expired", http.StatusForbidden)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func ResetPassword(state *state.State, w http.ResponseWriter, r *http.Request) {
	body := resetPasswordRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		serde.Error(w, "Expected non-empty body", http.StatusBadRequest)
		return
	}
	if body.Key == nil || body.Password == nil {
		serde.Error(w, "Expected {key, password}", http.StatusBadRequest)
		return
	}

	// Check that password reset key is valid and fetch corresponding userID and expiry
	var expiry time.Time
	var userID int
	err = state.Db.QueryRow(
		`SELECT user_id, expiry FROM secret.password_reset WHERE verify_key = $1`,
		*body.Key,
	).Scan(&userID, &expiry)
	if err != nil {
		serde.Error(w, "Invalid key", http.StatusBadRequest)
		return
	}

	// Check that key is not expired
	if !(expiry.After(time.Now())) {
		serde.Error(w, "Expired key", http.StatusInternalServerError)
		return
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(*body.Password), bcryptCost)
	if err != nil {
		serde.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	_, err = state.Db.Exec(
		`UPDATE secret.user_email SET password_hash = $1 WHERE user_id = $2`,
		passwordHash, userID,
	)
	if err != nil {
		serde.Error(w, "Error updating password", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
