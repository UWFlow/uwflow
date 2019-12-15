package auth

import (
	"fmt"

	"flow/api/serde"
	"flow/common/db"
	"flow/common/util/random"
)

// The higher this is, the harder it is to bruteforce stolen hashes and the slower auth will be
const BcryptCost = 10

// Length of secret_id for newly registered users
const SecretIdLength = 16

type userInfo struct {
	Email      string  `json:"email"`
	FirstName  string  `json:"first_name"`
	LastName   string  `json:"last_name"`
	JoinSource string  `json:"join_source"`
	PictureUrl *string `json:"picture_url"`
}

type authResponse struct {
	UserId   int    `json:"user_id"`
	SecretId string `json:"secret_id"`
	Token    string `json:"token"`
}

const insertUserQuery = `
INSERT INTO "user"(secret_id, email, first_name, last_name, join_source, picture_url)
VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
`

const selectJoinSourceQuery = `
SELECT join_source FROM "user" WHERE email = $1
`

func InsertUser(tx *db.Tx, user *userInfo) (*authResponse, error) {
	var response authResponse
	var err error

	response.SecretId, err = random.String(SecretIdLength, random.Uppercase)
	if err != nil {
		return nil, fmt.Errorf("generating secret id: %w", err)
	}

	var joinSource string
	err = tx.QueryRow(selectJoinSourceQuery, user.Email).Scan(&joinSource)
	if err == nil {
		var cause string
		switch joinSource {
		case "email":
			cause = serde.EmailTakenByEmail
		case "facebook":
			cause = serde.EmailTakenByFacebook
		case "google":
			cause = serde.EmailTakenByGoogle
		}
		return nil, serde.WithEnum(cause, fmt.Errorf("%s already registered as %s", user.Email, joinSource))
	}

	err = tx.QueryRow(
		insertUserQuery,
		response.SecretId, user.Email, user.FirstName, user.LastName, user.JoinSource, user.PictureUrl,
	).Scan(&response.UserId)
	if err != nil {
		return nil, fmt.Errorf("inserting user: %w", err)
	}

	response.Token, err = serde.NewSignedJwt(response.UserId)
	if err != nil {
		return nil, fmt.Errorf("signing jwt: %w", err)
	}

	return &response, nil
}
