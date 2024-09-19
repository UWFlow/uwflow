package auth

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"flow/api/serde"
	"flow/common/db"
)

const deleteAccountQuery = `
DELETE FROM "user"
WHERE id = $1
`

const deleteReviewsQuery = `
DELETE FROM review
WHERE user_id = $1
`

const selectAccountQuery = `
SELECT email, first_name, last_name FROM "user" WHERE id = $1
`

func DeleteAccount(conn *db.Conn, w http.ResponseWriter, r *http.Request) error {
	// Ensure user is authenticated
	userId, err := serde.UserIdFromRequest(r)
	if err != nil {
		return serde.WithStatus(http.StatusUnauthorized, fmt.Errorf("extracting user id: %w", err))
	}

	var info userInfo
	err = conn.QueryRow(selectAccountQuery, userId).Scan(&info.Email, &info.FirstName, &info.LastName)
	if err != nil {
		if err == sql.ErrNoRows {
			return serde.WithStatus(http.StatusNotFound, fmt.Errorf("user id not found: %d", userId))
		}
		return fmt.Errorf("fetching user data: %w", err)
	}

	// Delete the user account
	_, err = conn.Exec(deleteAccountQuery, userId)
	if err != nil {
		return fmt.Errorf("deleting user account: %w", err)
	}

	log.Printf("Deleted user %d: %s %s <%s>", userId, info.FirstName, info.LastName, *info.Email)
	return err
}
