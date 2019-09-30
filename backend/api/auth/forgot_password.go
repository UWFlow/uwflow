package auth

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"net/smtp"
	"strconv"
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/AyushK1/uwflow2.0/backend/api/serde"
	"github.com/AyushK1/uwflow2.0/backend/api/state"
)

type sendEmailRequest struct {
	Email *string `json:"email"`
}

type resetPasswordRequest struct {
	Key      *string `json:"key"`
	Password *string `json:"password"`
}

func generateRandomString(n int, seed int64) string {
	rand.Seed(seed)
	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	code := make([]rune, n)
	for i := range code {
		code[i] = letters[rand.Intn(len(letters))]
	}
	return string(code)
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
	err = state.Conn.QueryRow(
		`SELECT user_id FROM secret.user_email WHERE email = $1`,
		*body.Email,
	).Scan(&userID)
	if err != nil {
		serde.Error(w, "Email not found", http.StatusBadRequest)
		return
	}

	// generate unique code which expires in 1 hour
	expiry := time.Now().UnixNano() + int64(3600000000000)
	code := generateRandomString(6, expiry)

	// Set up authentication information.
	auth := smtp.PlainAuth("", "user@example.com", "password", "mail.example.com")
	// Connect to the server, authenticate, set the sender and recipient,
	// and send the email all in one step.
	to := []string{*body.Email}
	msg := []byte(fmt.Sprintf("To: %s\r\n", *body.Email) +
		fmt.Sprintf("Subject: %s\r\n", code) +
		"\r\n" +
		"This is the email body.\r\n")
	err = smtp.SendMail("mail.example.com:25", auth, "sender@example.org", to, msg)
	if err != nil {
		serde.Error(w, "Error sending forgot password email", http.StatusInternalServerError)
	}

	// Attempt to insert generated code and userID into secret.password_reset table
	_, err = state.Conn.Exec(
		`INSERT INTO secret.password_reset(user_id, verify_key, expiry) VALUES ($1, $2, $3)`,
		userID, code, strconv.FormatInt(expiry, 10),
	)
	if err != nil {
		serde.Error(w, "Error writing to db", http.StatusInternalServerError)
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
	err := state.Conn.QueryRow(
		`SELECT EXISTS(SELECT 1 FROM secret.password_reset WHERE verify_key = $1)`,
		key,
	).Scan(&keyExists)
	if err != nil {
		serde.Error(w, "Provided key not found", http.StatusBadRequest)
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
	var expiry string
	var userID int
	err = state.Conn.QueryRow(
		`SELECT user_id, expiry FROM secret.password_reset WHERE verify_key = $1`,
		*body.Key,
	).Scan(&userID, &expiry)
	if err != nil {
		serde.Error(w, "Invalid key", http.StatusBadRequest)
		return
	}

	// Check that key is not expired
	expiryNano, err := strconv.ParseInt(expiry, 10, 64)
	if err != nil {
		serde.Error(w, "Key error", http.StatusInternalServerError)
		return
	}
	if expiryNano <= time.Now().UnixNano() {
		serde.Error(w, "Expired key", http.StatusBadRequest)
		return
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(*body.Password), bcryptCost)
	if err != nil {
		serde.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	_, err = state.Conn.Exec(
		`UPDATE secret.user_email SET password_hash = $1 WHERE user_id = $2`,
		passwordHash, userID,
	)
	if err != nil {
		serde.Error(w, "Error updating password", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
