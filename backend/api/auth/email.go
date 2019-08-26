package auth

import (
	"encoding/json"
	"errors"
	"net/http"
	"os"

	"github.com/AyushK1/uwflow2.0/backend/api/db"
	"github.com/AyushK1/uwflow2.0/backend/api/serde"

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

type EmailAuthRecord struct {
	Id           int    `db:"user_id"`
	Email        string `db:"email"`
	PasswordHash []byte `db:"password_hash"`
}

// This is the string "password", hashed
// If no email is found, we try to match against this,
// thereby faithfully emulating a legitimate bcrypt delay
const fakeHash = "$2b$12$.6SjO/j0qspENIWCnVAk..34gBq5TGG1FtBsnfMRCzsrKg3Tm7XsG"

// Default value for bcrypt cost/difficulty
const bcryptCost = 10

func authenticate(email string, password []byte) (int, error) {
	target := EmailAuthRecord{PasswordHash: []byte(fakeHash)}
	dbErr := db.Handle.Get(&target,
		"SELECT user_id, password_hash FROM secret.user_email WHERE email = $1",
		email)
	// Always attempt auth to prevent enumeration of valid emails
	authErr := bcrypt.CompareHashAndPassword(target.PasswordHash, password)
	if dbErr != nil {
		return target.Id, dbErr
	} else {
		return target.Id, authErr
	}
}

func AuthenticateEmail(w http.ResponseWriter, r *http.Request) {
	body := EmailAuthLoginRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		serde.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if body.Email == "" || body.Password == "" {
		serde.Error(w, "Expected {email, password}", http.StatusBadRequest)
		return
	}

	id, err := authenticate(body.Email, []byte(body.Password))
	if err != nil {
		serde.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	json.NewEncoder(w).Encode(serde.MakeAndSignHasuraJWT(id, []byte(os.Getenv("HASURA_GRAPHQL_JWT_KEY"))))
}

func register(name string, email string, password []byte) (int, error) {
	// Check db if email is already being used
	var emailExists bool
	emailErr := db.Handle.QueryRow(
		"SELECT EXISTS(SELECT 1 FROM secret.user_email WHERE email = $1)",
		email).Scan(&emailExists)
	if emailErr != nil {
		return 0, emailErr
	} else if emailExists {
		return 0, errors.New("Email already exists")
	}

	var userId int
	err := db.Handle.QueryRow(`INSERT INTO "user"(full_name) VALUES ($1) RETURNING id`, name).Scan(&userId)
	if err != nil {
		return 0, err
	}

	// Store the password hash as a column
	passwordHash, hashErr := bcrypt.GenerateFromPassword(password, bcryptCost)
	if hashErr != nil {
		return 0, hashErr
	}
	db.Handle.MustExec(
		"INSERT INTO secret.user_email(user_id, email, password_hash) VALUES ($1, $2, $3)",
		userId, email, passwordHash,
	)
	return userId, nil
}

func RegisterEmail(w http.ResponseWriter, r *http.Request) {
	body := EmailAuthRegisterRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		serde.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if body.Email == nil || body.Password == nil || body.Name == nil {
		serde.Error(w, "Expected {name, email, password}", http.StatusBadRequest)
		return
	}

	id, err := register(*body.Name, *body.Email, []byte(*body.Password))
	if err != nil {
		serde.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	json.NewEncoder(w).Encode(serde.MakeAndSignHasuraJWT(id, []byte(os.Getenv("HASURA_GRAPHQL_JWT_KEY"))))
}
