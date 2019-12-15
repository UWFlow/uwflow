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

type AuthResponse struct {
	UserId   int    `json:"user_id"`
	SecretId string `json:"secret_id"`
	Token    string `json:"token"`
}

const insertUserQuery = `
INSERT INTO "user"(full_name, email, join_source, picture_url, secret_id)
VALUES ($1, $2, $3, $4, $5) RETURNING id
`

const selectJoinSourceQuery = `
SELECT join_source FROM "user" WHERE email = $1
`

func InsertUser(tx *db.Tx, name, email, joinSource string, pictureUrl *string) (*AuthResponse, error) {
	var response AuthResponse
	var err error

	response.SecretId, err = random.String(SecretIdLength, random.Uppercase)
	if err != nil {
		return nil, fmt.Errorf("generating secret id: %w", err)
	}

	err = tx.QueryRow(selectJoinSourceQuery, email).Scan(&joinSource)
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
		return nil, serde.WithEnum(cause, fmt.Errorf("%s already registered as %s", email, joinSource))
	}

	err = tx.QueryRow(insertUserQuery, name, email, joinSource, pictureUrl, response.SecretId).Scan(&response.UserId)
	if err != nil {
		return nil, fmt.Errorf("inserting user: %w", err)
	}

	response.Token, err = serde.NewSignedJwt(response.UserId)
	if err != nil {
		return nil, fmt.Errorf("signing jwt: %w", err)
	}

	return &response, nil
}
