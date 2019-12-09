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
		return id, serde.WithEnum("email_login_invalid_email", fmt.Errorf("querying user info for email %s: not an email user", email))
	}

	err = conn.QueryRow(
		"SELECT password_hash FROM secret.user_email WHERE user_id = $1",
		id,
	).Scan(&hash)
	if err != nil {
		return id, serde.WithEnum("email_login_invalid_password", fmt.Errorf("fetching password hash for user_id: %w", err))
	}

	err = bcrypt.CompareHashAndPassword(hash, password)
	if err != nil {
		return 0, serde.WithEnum("email_login_invalid_password", fmt.Errorf("comparing hash and password: %w", err))
	}
	return id, nil
}

func authenticateEmail(state *state.State, r *http.Request) (*AuthResponse, error, int) {
	body := EmailAuthLoginRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		return nil, serde.WithEnum("email_login_bad_request", fmt.Errorf("decoding email auth request: %w", err)), http.StatusBadRequest
	}

	if body.Email == "" || body.Password == "" {
		return nil, serde.WithEnum("email_login_bad_request", fmt.Errorf("decoding email auth request: empty email, password")), http.StatusBadRequest
	}

	id, err := authenticate(state.Db, body.Email, []byte(body.Password))
	if err != nil {
		return nil, fmt.Errorf("authenticating email user: %w", err), http.StatusUnauthorized
	}

	data := &AuthResponse{
		Token: serde.MakeAndSignHasuraJWT(id, state.Env.JwtKey),
		ID:    id,
	}
	return data, nil, http.StatusOK
}

func AuthenticateEmail(state *state.State, w http.ResponseWriter, r *http.Request) {
	response, err, status := authenticateEmail(state, r)
	if err != nil {
		serde.Error(w, err, status)
	}
	json.NewEncoder(w).Encode(response)
}

func register(conn *db.Conn, name string, email string, password []byte) (int, error) {
	tx, err := conn.Begin()
	if err != nil {
		return 0, fmt.Errorf("connecting to db: %w", err)
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
		return 0, serde.WithEnum("email_register", fmt.Errorf("checking if email exists in db: %w", emailErr))
	} else if emailExists {
		var joinSource string
		err = tx.QueryRow(`SELECT join_source FROM public.user WHERE email = $1`).Scan(&joinSource)
		if err != nil {
			return 0, serde.WithEnum("email_register", fmt.Errorf("checking if email exists in db: %w", emailErr))
		}
		return 0, serde.WithEnum(fmt.Sprintf("email_register_exists_%s", joinSource), fmt.Errorf("checking if email exists in db: email already exists for %s user", joinSource))
	}

	var userId int
	dbErr := tx.QueryRow(
		`INSERT INTO "user"(full_name, email, join_source) VALUES ($1, $2, $3) RETURNING id`,
		name, email, "email",
	).Scan(&userId)
	if dbErr != nil {
		return 0, serde.WithEnum("email_register", fmt.Errorf("inserting new email user into db: %w", dbErr))
	}

	// Store the password hash as a column
	passwordHash, hashErr := bcrypt.GenerateFromPassword(password, bcryptCost)
	if hashErr != nil {
		return 0, serde.WithEnum("email_register", fmt.Errorf("hashing password: %w", hashErr))
	}

	_, writeErr := tx.Exec(
		`INSERT INTO secret.user_email(user_id, password_hash) VALUES ($1, $2)`,
		userId, passwordHash,
	)
	if writeErr != nil {
		return 0, serde.WithEnum("email_register", fmt.Errorf("writing user_id, password_hash to db: %w", writeErr))
	}

	commitErr := tx.Commit()
	if commitErr != nil {
		return 0, serde.WithEnum("email_register", fmt.Errorf("committing: %w", commitErr))
	}

	return userId, nil
}

func registerEmail(state *state.State, r *http.Request) (*AuthResponse, error, int) {
	body := EmailAuthRegisterRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		return nil, serde.WithEnum("email_register_bad_request", fmt.Errorf("decoding email register request: %w", err)), http.StatusBadRequest
	}

	if body.Email == nil || body.Password == nil || body.Name == nil {
		return nil, serde.WithEnum("email_register_bad_request", fmt.Errorf("decoding email register request: empty name, email, or password")), http.StatusBadRequest
	}

	id, err := register(state.Db, *body.Name, *body.Email, []byte(*body.Password))
	if err != nil {
		return nil, serde.WithEnum("email", fmt.Errorf("registering email user: %w", err)), http.StatusUnauthorized
	}

	data := &AuthResponse{
		Token: serde.MakeAndSignHasuraJWT(id, state.Env.JwtKey),
		ID:    id,
	}
	return data, nil, http.StatusOK
}

func RegisterEmail(state *state.State, w http.ResponseWriter, r *http.Request) {
	response, err, status := registerEmail(state, r)
	if err != nil {
		serde.Error(w, err, status)
	}
	json.NewEncoder(w).Encode(response)
}
