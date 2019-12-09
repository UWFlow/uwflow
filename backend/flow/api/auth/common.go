package auth

import (
	"fmt"
	"net/smtp"

	"flow/api/env"
	"flow/api/serde"
	"flow/common/db"
)

type AuthResponse struct {
	UserId   int    `json:"user_id"`
	SecretId string `json:"secret_id"`
	Token    string `json:"token"`
}

// Length of secret_id for newly registered users
const SecretLength = 12

const InsertUserQuery = `
INSERT INTO "user"(full_name, email, join_source, picture_url, secret_id)
VALUES ($1, $2, $3, $4, $5) RETURNING id
`

func InsertUser(tx *db.Tx, name, email, joinSource string, pictureUrl *string) (*AuthResponse, error) {
	var response AuthResponse
	var err error

	response.SecretId, err = GenerateRandomString(SecretLength)
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

func SendAutomatedEmail(to []string, subject string, body string) error {
	// Set up authentication information for Gmail server
	from := env.Global.GmailUser
	auth := smtp.PlainAuth("", from, env.Global.GmailAppPassword, "smtp.gmail.com")
	msg := []byte(fmt.Sprintf("To: %s\r\n", to[0]) +
		fmt.Sprintf("Subject: %s\r\n", subject) +
		"\r\n" +
		fmt.Sprintf("%s\r\n", body))
	err := smtp.SendMail("smtp.gmail.com:587", auth, from, to, msg)
	if err != nil {
		return fmt.Errorf("failed to send email to %w", to[0])
	}
	return nil
}
