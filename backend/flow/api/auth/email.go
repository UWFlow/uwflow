package auth

import (
	"encoding/json"
	"fmt"
	"net/http"

	"flow/api/serde"
	"flow/common/db"
	"flow/common/state"

	"golang.org/x/crypto/bcrypt"
)

type EmailAuthLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type EmailAuthRegisterRequest struct {
	Name     *string `json:"name"`
	Email    *string `json:"email"`
	Password *string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
	ID    int    `json:"user_id"`
}

// This is the string "password", hashed
// If no email is found, we try to match against this,
// thereby faithfully emulating a legitimate bcrypt delay
const fakeHash = "$2b$12$.6SjO/j0qspENIWCnVAk..34gBq5TGG1FtBsnfMRCzsrKg3Tm7XsG"

// Default value for bcrypt cost/difficulty
const bcryptCost = 10

func authenticate(conn *db.Conn, email string, password []byte) (int, error) {
	var id int
	var join_source string
	var hash []byte

	err := conn.QueryRow(
		"SELECT id, join_source FROM public.user WHERE email = $1",
		email,
	).Scan(&id, &join_source)
	if err != nil || join_source != "email" {
		// Always attempt auth to prevent enumeration of registered emails
		bcrypt.CompareHashAndPassword([]byte(fakeHash), password)
		return id, fmt.Errorf("checking creds with db: %w", err.Error())
	}

	err = conn.QueryRow(
		"SELECT password_hash FROM secret.user_email WHERE user_id = $1",
		id,
	).Scan(&hash)
	if err != nil {
		return id, fmt.Errorf("checking creds with db: %w", err.Error())
	} else {
		err := bcrypt.CompareHashAndPassword(hash, password)
		return id, fmt.Errorf("checking creds with db: %w", err.Error())
	}
}

func AuthenticateEmail(state *state.State, w http.ResponseWriter, r *http.Request) {
	body := EmailAuthLoginRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		serde.Error(w, serde.WithEnum("email", fmt.Errorf("authenticating email user: %w", err.Error())), http.StatusBadRequest)
		return
	}

	if body.Email == "" || body.Password == "" {
		serde.Error(w, serde.WithEnum("email", fmt.Errorf("authenticating email user: expected email and password in request")), http.StatusBadRequest)
		return
	}

	id, err := authenticate(state.Db, body.Email, []byte(body.Password))
	if err != nil {
		serde.Error(w, serde.WithEnum("email", fmt.Errorf("authenticating email user: %w", err.Error())), http.StatusUnauthorized)
		return
	}

	data := AuthResponse{
		Token: serde.MakeAndSignHasuraJWT(id, state.Env.JwtKey),
		ID:    id,
	}
	json.NewEncoder(w).Encode(data)
}

func register(conn *db.Conn, name string, email string, password []byte) (int, error) {
	tx, err := conn.Begin()
	if err != nil {
		return 0, fmt.Errorf("registering email to db: %w", err.Error())
	}
	defer tx.Rollback()

	// Check db if email is already being used
	// Note that email is invalid regardless of which type of user
	// it's associated with (email | google | facebook)
	var emailExists bool
	emailErr := tx.QueryRow(
		`SELECT EXISTS(SELECT 1 FROM public.user WHERE email = $1)`,
		email,
	).Scan(&emailExists)
	if emailErr != nil {
		return 0, fmt.Errorf("checking email with db: %w", emailErr.Error())
	} else if emailExists {
		return 0, fmt.Errorf("checking email with db: email already exists")
	}

	var userId int
	dbErr := tx.QueryRow(
		`INSERT INTO "user"(full_name, email, join_source) VALUES ($1, $2, $3) RETURNING id`,
		name, email, "email",
	).Scan(&userId)
	if dbErr != nil {
		return 0, fmt.Errorf("checking email with db: %w", dbErr.Error())
	}

	// Store the password hash as a column
	passwordHash, hashErr := bcrypt.GenerateFromPassword(password, bcryptCost)
	if hashErr != nil {
		return 0, fmt.Errorf("hashing password: %w", hashErr.Error())
	}

	_, writeErr := tx.Exec(
		`INSERT INTO secret.user_email(user_id, password_hash) VALUES ($1, $2)`,
		userId, passwordHash,
	)
	if writeErr != nil {
		return 0, fmt.Errorf("registering email and password: %w", writeErr.Error())
	}

	commitErr := tx.Commit()
	if commitErr != nil {
		return 0, fmt.Errorf("registering email and password: %w", commitErr.Error())
	}

	return userId, nil
}

func RegisterEmail(state *state.State, w http.ResponseWriter, r *http.Request) {
	body := EmailAuthRegisterRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		serde.Error(w, serde.WithEnum("email", fmt.Errorf("registering email user: %w", err.Error())), http.StatusBadRequest)
		return
	}

	if body.Email == nil || body.Password == nil || body.Name == nil {
		serde.Error(w, serde.WithEnum("email", fmt.Errorf("registering email user: expected name, email, password in request")), http.StatusBadRequest)
		return
	}

	id, err := register(state.Db, *body.Name, *body.Email, []byte(*body.Password))
	if err != nil {
		serde.Error(w, serde.WithEnum("email", fmt.Errorf("registering email user: %w", err.Error())), http.StatusBadRequest)
		return
	}

	data := AuthResponse{
		Token: serde.MakeAndSignHasuraJWT(id, state.Env.JwtKey),
		ID:    id,
	}
	json.NewEncoder(w).Encode(data)
}
