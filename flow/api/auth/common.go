package auth

import (
	"fmt"
	"strings"

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
	IsNew  bool   `json:"is_new"`
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

	var invitedEmail string
	if user.Email != nil {
		invitedEmail = strings.ToLower(strings.TrimSpace(*user.Email))
	}
	if invitedEmail != "" {
		// Use the invite endpoint's lock before inserting the account. Whichever
		// transaction runs second must see the other's account or pending invites.
		if _, err := tx.Exec(`SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`, invitedEmail); err != nil {
			return nil, fmt.Errorf("locking signup email: %w", err)
		}
	}

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

	if invitedEmail != "" {
		// Copy only outstanding invitations, not accepted memberships. Run once
		// at signup so logging in cannot recreate invitations the user declined.
		_, err = tx.Exec(`
			INSERT INTO shared_group_member (group_id, user_id, status, created_at)
			SELECT m.group_id, $1, 'pending', MIN(m.created_at)
			FROM shared_group_member m
			JOIN "user" u ON u.id = m.user_id
			WHERE LOWER(u.email) = $2 AND m.status = 'pending'
			GROUP BY m.group_id
			ORDER BY MIN(m.created_at), m.group_id
			LIMIT 20
			ON CONFLICT (group_id, user_id) DO NOTHING
		`, response.UserId, invitedEmail)
		if err != nil {
			return nil, fmt.Errorf("inheriting pending group invites: %w", err)
		}
	}

	response.Token, err = serde.NewSignedJwt(response.UserId)
	if err != nil {
		return nil, fmt.Errorf("signing jwt: %w", err)
	}

	response.IsNew = true

	return &response, nil
}
