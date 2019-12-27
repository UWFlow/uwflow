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
	FirstName  string  `json:"first_name"`
	LastName   string  `json:"last_name"`
	JoinSource string  `json:"join_source"`
	Email      *string `json:"email"`
	PictureUrl *string `json:"picture_url"`
}

type authResponse struct {
	UserId int    `json:"user_id"`
	Token  string `json:"token"`
}

const insertUserQuery = `
INSERT INTO "user"(secret_id, email, first_name, last_name, join_source, picture_url)
VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
`

const updateEmailQuery = `
UPDATE "user" SET email = $2 WHERE id = $1
`

const updatePictureQuery = `
UPDATE "user" SET picture_url = $2 WHERE id = $1
`

func InsertUser(tx *db.Tx, user *userInfo) (*authResponse, error) {
	var response authResponse

	secretId, err := random.String(SecretIdLength, random.Uppercase)
	if err != nil {
		return nil, fmt.Errorf("generating secret id: %w", err)
	}

	err = tx.QueryRow(
		insertUserQuery,
		secretId, user.Email, user.FirstName, user.LastName, user.JoinSource, user.PictureUrl,
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
