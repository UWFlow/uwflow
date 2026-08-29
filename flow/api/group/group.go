// Package group serves the one Shared Classes operation that cannot be a
// GraphQL query.
//
// Everything a client reads about a group -- the groups you are in, who is in
// them, and the classes they share -- comes from Hasura, off the views in the
// shared_classes_views migration, under the permissions in that metadata.
// Creating, accepting, declining, leaving and deleting are row-level writes on
// shared_group and shared_group_member, and are Hasura's too.
//
// Inviting is not, and cannot be. It takes an email address and has to decide
// whether an account exists behind it, which is exactly the question a public
// GraphQL API must never answer: any permission that lets a client match on
// "user".email turns the schema into an account-enumeration oracle. So the
// lookup happens here, server-side, and the response says only that the invite
// was sent.
package group

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"flow/api/serde"
	"flow/common/db"

	"github.com/go-chi/chi/v5"
)

// Invite resolves an email to a Flow account and, when there is one, adds a
// pending membership for it. The response is the same either way.
func Invite(tx *db.Tx, r *http.Request) (interface{}, error) {
	userId, err := serde.UserIdFromRequest(r)
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, err)
	}

	gid, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("invalid group id: %w", err))
	}

	// Only a confirmed member may invite. EXISTS answers for a group that does
	// not exist as readily as for one the caller is not in, which is what we
	// want: telling those two apart would leak which group ids are real.
	var isMember bool
	err = tx.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM shared_group_member
			WHERE group_id = $1 AND user_id = $2 AND status = 'member'
		)
	`, gid, userId).Scan(&isMember)
	if err != nil {
		return nil, fmt.Errorf("checking membership: %w", err)
	}
	if !isMember {
		return nil, serde.WithStatus(http.StatusForbidden, fmt.Errorf("not a member of this group"))
	}

	var body struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("invalid request body: %w", err))
	}
	email := strings.ToLower(strings.TrimSpace(body.Email))
	if email == "" || !strings.Contains(email, "@") {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("enter a valid email"))
	}

	sent := map[string]interface{}{"status": "sent"}

	var targetId int
	err = tx.QueryRow(`SELECT id FROM "user" WHERE LOWER(email) = $1`, email).Scan(&targetId)
	if err != nil {
		// No account behind the address. shared_group_invite exists to carry
		// this case, but nothing mails it yet, so there is nothing useful to
		// write: recording a row here would only queue mail no one sends.
		return sent, nil
	}

	// A pending shared_group_member row is the invite: the invitee accepts by
	// updating it to 'member' and declines by deleting it, both through Hasura.
	// An existing membership is left alone, so an invite never demotes someone
	// who has already joined.
	_, err = tx.Exec(`
		INSERT INTO shared_group_member (group_id, user_id, status)
		VALUES ($1, $2, 'pending')
		ON CONFLICT (group_id, user_id) DO NOTHING
	`, gid, targetId)
	if err != nil {
		return nil, fmt.Errorf("adding pending member: %w", err)
	}
	return sent, nil
}
