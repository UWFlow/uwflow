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
SELECT id, secret_id, join_source FROM "user" WHERE email = $1
`

const selectHashQuery = `
SELECT password_hash FROM secret.user_email WHERE user_id = $1
`

func loginEmail(tx *db.Tx, email string, password []byte) (*AuthResponse, error) {
	var response AuthResponse
	var joinSource string
	var hash []byte

	err := tx.QueryRow(selectUserQuery, email).Scan(&response.UserId, &response.SecretId, &joinSource)
	if err != nil || joinSource != "email" {
		return nil, serde.WithEnum(serde.EmailNotRegistered, fmt.Errorf("email not registered: %s", email))
	}

	err = tx.QueryRow(selectHashQuery, response.UserId).Scan(&hash)
	if err != nil {
		return nil, fmt.Errorf("fetching password hash: %w", err)
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
INSERT INTO secret.user_email(user_id, password_hash) VALUES ($1, $2)
`

func registerEmail(tx *db.Tx, name string, email string, password []byte) (*AuthResponse, error) {
	response, err := InsertUser(tx, name, email, "email", nil)
	if err != nil {
		return nil, err
	}

	hash, err := bcrypt.GenerateFromPassword(password, BcryptCost)
	if err != nil {
		return nil, fmt.Errorf("hashing password: %w", err)
	}

	_, err = tx.Exec(insertUserEmailQuery, response.UserId, hash)
	if err != nil {
		return nil, fmt.Errorf("inserting user_email: %w", err)
	}

	return response, nil
}

type emailRegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
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

	if body.Email == "" || body.Password == "" || body.Name == "" {
		return nil, serde.WithStatus(
			http.StatusBadRequest,
			serde.WithEnum(serde.ConstraintViolation, fmt.Errorf("empty name, email, or password")),
		)
	}

	if len(body.Password) < MinPasswordLength {
		return nil, serde.WithStatus(
			http.StatusBadRequest,
			serde.WithEnum(serde.ConstraintViolation, fmt.Errorf("password is too short")),
		)
	}

	if len(body.Email) < MinEmailLength {
		return nil, serde.WithStatus(
			http.StatusBadRequest,
			serde.WithEnum(serde.ConstraintViolation, fmt.Errorf("email is too short")),
		)
	}

	resp, err := registerEmail(tx, body.Name, body.Email, []byte(body.Password))
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, err)
	}

	return resp, nil
}
