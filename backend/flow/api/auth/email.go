package auth

import (
	"encoding/json"
	"fmt"
	"net/http"

	"flow/api/serde"
	"flow/common/db"

	"golang.org/x/crypto/bcrypt"
)

type emailLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

const selectUserQuery = `
SELECT user_id, password_hash FROM secret.user_email WHERE email = $1
`

func loginEmail(tx *db.Tx, email string, password []byte) (*authResponse, error) {
	var response authResponse
	var hash []byte

	err := tx.QueryRow(selectUserQuery, email).Scan(&response.UserId, &hash)
	if err != nil {
		return nil, serde.WithEnum(serde.EmailNotRegistered, fmt.Errorf("email not registered: %s: %w", email))
	}

	err = bcrypt.CompareHashAndPassword(hash, password)
	if err != nil {
		return nil, serde.WithEnum(serde.EmailWrongPassword, fmt.Errorf("comparing hash and password: %w", err))
	}

	response.Token, err = serde.NewSignedJwt(response.UserId)
	if err != nil {
		return nil, fmt.Errorf("signing jwt: %w", err)
	}

	return &response, nil
}

func LoginEmail(tx *db.Tx, r *http.Request) (interface{}, error) {
	var body emailLoginRequest
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("malformed JSON: %w", err))
	}

	if body.Email == "" || body.Password == "" {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("empty email, password"))
	}

	response, err := loginEmail(tx, body.Email, []byte(body.Password))
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, err)
	}

	return response, nil
}

const insertUserEmailQuery = `
INSERT INTO secret.user_email(user_id, email, password_hash) VALUES ($1, $2, $3)
`

func registerEmail(tx *db.Tx, user *userInfo, password []byte) (*authResponse, error) {
	response, err := InsertUser(tx, user)
	if err != nil {
		return nil, err
	}

	hash, err := bcrypt.GenerateFromPassword(password, BcryptCost)
	if err != nil {
		return nil, fmt.Errorf("hashing password: %w", err)
	}

	_, err = tx.Exec(insertUserEmailQuery, response.UserId, user.Email, hash)
	if err != nil {
		return nil, serde.WithEnum(serde.EmailTaken, fmt.Errorf("inserting user_email: %w", err))
	}

	return response, nil
}

type emailRegisterRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Password  string `json:"password"`
}

const (
	MinPasswordLength = 6
	MinEmailLength    = 6
)

func RegisterEmail(tx *db.Tx, r *http.Request) (interface{}, error) {
	var body emailRegisterRequest
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("malformed JSON: %w", err))
	}

	if body.Email == "" || body.Password == "" || body.FirstName == "" || body.LastName == "" {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("empty name, email, or password"))
	}

	if len(body.Password) < MinPasswordLength {
		return nil, serde.WithStatus(
			http.StatusBadRequest,
			serde.WithEnum(serde.PasswordTooShort, fmt.Errorf("password is too short")),
		)
	}

	if len(body.Email) < MinEmailLength {
		return nil, serde.WithStatus(
			http.StatusBadRequest,
			serde.WithEnum(serde.EmailTooShort, fmt.Errorf("email is too short")),
		)
	}

	user := userInfo{FirstName: body.FirstName, LastName: body.LastName, Email: &body.Email, JoinSource: "email"}
	resp, err := registerEmail(tx, &user, []byte(body.Password))
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, err)
	}

	return resp, nil
}
