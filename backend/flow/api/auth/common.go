package auth

import (
	"fmt"

	"flow/api/serde"
	"flow/common/db"
	"flow/common/util/random"
)

type AuthResponse struct {
	UserId   int    `json:"user_id"`
	SecretId string `json:"secret_id"`
	Token    string `json:"token"`
}

// Length of secret_id for newly registered users
const SecretIdLength = 16

const InsertUserQuery = `
INSERT INTO "user"(full_name, email, join_source, picture_url, secret_id)
VALUES ($1, $2, $3, $4, $5) RETURNING id
`

func InsertUser(tx *db.Tx, name, email, joinSource string, pictureUrl *string) (*AuthResponse, error) {
	var response AuthResponse
	var err error

	response.SecretId, err = random.String(SecretIdLength, random.Uppercase)
	if err != nil {
		return nil, fmt.Errorf("generating secret id: %w", err)
	}

	err = tx.QueryRow(
		InsertUserQuery, name, email, joinSource, pictureUrl, response.SecretId,
	).Scan(&response.UserId)
	if err != nil {
		return nil, fmt.Errorf("inserting user: %w", err)
	}

	response.Token = serde.MakeAndSignHasuraJWT(response.UserId)

	return &response, nil
}
