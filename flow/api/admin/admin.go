// Package admin implements the staff-facing console: looking users up and
// opening a read-only impersonation session against one of them.
//
// Two rules hold everywhere in this package:
//
//  1. Every handler resolves the caller through requireAdmin, which refuses
//     both non-admins and anyone already inside an impersonation session. An
//     impersonation token can therefore never be used to start another one, so
//     sessions cannot be chained to launder who did what.
//  2. Impersonation is recorded before the token is issued. If the audit
//     insert fails the transaction rolls back and no token is minted, so a
//     session cannot exist without a row describing it.
package admin

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"flow/api/serde"
	"flow/common/db"
)

const isAdminQuery = `SELECT is_admin FROM "user" WHERE id = $1`

// requireAdmin authenticates the caller and asserts they may use the console.
func requireAdmin(tx *db.Tx, r *http.Request) (int, error) {
	claims, err := serde.ClaimsFromRequest(r)
	if err != nil {
		return 0, serde.WithStatus(http.StatusUnauthorized, fmt.Errorf("extracting claims: %w", err))
	}

	// An impersonation session acts as the target, who is by construction not
	// an admin — but refuse explicitly rather than relying on that, so the rule
	// survives any future change to who can be impersonated.
	if claims.Impersonating() {
		return 0, serde.WithStatus(http.StatusForbidden, serde.WithEnum(
			serde.ImpersonationForbidden,
			fmt.Errorf("cannot use the admin console while impersonating"),
		))
	}

	userId, err := claims.UserId()
	if err != nil {
		return 0, serde.WithStatus(http.StatusUnauthorized, err)
	}

	var isAdmin bool
	if err := tx.QueryRow(isAdminQuery, userId).Scan(&isAdmin); err != nil {
		// A token for a deleted user lands here: no row, so no admin.
		return 0, serde.WithStatus(http.StatusForbidden, serde.WithEnum(
			serde.NotAdmin, fmt.Errorf("loading admin flag for user %d: %w", userId, err),
		))
	}
	if !isAdmin {
		return 0, serde.WithStatus(http.StatusForbidden, serde.WithEnum(
			serde.NotAdmin, fmt.Errorf("user %d is not an admin", userId),
		))
	}

	return userId, nil
}

/* GET /admin/me */

type whoAmIResponse struct {
	UserId  int  `json:"user_id"`
	IsAdmin bool `json:"is_admin"`
}

// HandleWhoAmI lets the frontend gate the console's entry points. It is the
// only admin route that answers 200 for a non-admin, because "no" is a normal
// answer here rather than a rejection.
func HandleWhoAmI(tx *db.Tx, r *http.Request) (interface{}, error) {
	claims, err := serde.ClaimsFromRequest(r)
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, fmt.Errorf("extracting claims: %w", err))
	}

	userId, err := claims.UserId()
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, err)
	}

	// Never report an impersonated session as an admin one, whatever the
	// target's flag says.
	if claims.Impersonating() {
		return &whoAmIResponse{UserId: userId, IsAdmin: false}, nil
	}

	var isAdmin bool
	if err := tx.QueryRow(isAdminQuery, userId).Scan(&isAdmin); err != nil {
		return nil, fmt.Errorf("loading admin flag: %w", err)
	}

	return &whoAmIResponse{UserId: userId, IsAdmin: isAdmin}, nil
}

/* GET /admin/users */

// Counts come from correlated subqueries rather than joins with GROUP BY:
// the result set is capped at searchLimit rows, so this stays cheap and keeps
// users with no reviews or no schedule in the results.
const searchUsersQuery = `
SELECT
  u.id,
  u.first_name,
  u.last_name,
  u.email,
  u.program,
  u.picture_url,
  u.join_source,
  u.join_date,
  u.is_admin,
  (SELECT COUNT(*) FROM review r WHERE r.user_id = u.id),
  (SELECT COUNT(*) FROM user_schedule s WHERE s.user_id = u.id)
FROM "user" u
WHERE
  $1 = ''
  OR u.email ILIKE '%' || $1 || '%'
  OR u.full_name ILIKE '%' || $1 || '%'
  OR CAST(u.id AS TEXT) = $1
ORDER BY
  -- Exact id match first, so pasting an id from a bug report lands on it even
  -- when the digits also appear inside somebody's email address.
  (CAST(u.id AS TEXT) = $1) DESC,
  u.join_date DESC
LIMIT $2
`

const searchLimit = 50

type adminUser struct {
	Id           int     `json:"id"`
	FirstName    string  `json:"first_name"`
	LastName     string  `json:"last_name"`
	Email        *string `json:"email"`
	Program      *string `json:"program"`
	PictureUrl   *string `json:"picture_url"`
	JoinSource   string  `json:"join_source"`
	JoinDate     string  `json:"join_date"`
	IsAdmin      bool    `json:"is_admin"`
	ReviewCount  int     `json:"review_count"`
	ScheduleSize int     `json:"schedule_size"`
}

type searchUsersResponse struct {
	Users []adminUser `json:"users"`
}

func HandleSearchUsers(tx *db.Tx, r *http.Request) (interface{}, error) {
	if _, err := requireAdmin(tx, r); err != nil {
		return nil, err
	}

	query := strings.TrimSpace(r.URL.Query().Get("q"))

	rows, err := tx.Query(searchUsersQuery, query, searchLimit)
	if err != nil {
		return nil, fmt.Errorf("searching users: %w", err)
	}
	defer rows.Close()

	// Not `var users []adminUser`: a nil slice marshals to `null`, and the
	// frontend would have to defend against it on every empty search.
	users := []adminUser{}
	for rows.Next() {
		var u adminUser
		var joinDate time.Time
		err := rows.Scan(
			&u.Id, &u.FirstName, &u.LastName, &u.Email, &u.Program, &u.PictureUrl,
			&u.JoinSource, &joinDate, &u.IsAdmin, &u.ReviewCount, &u.ScheduleSize,
		)
		if err != nil {
			return nil, fmt.Errorf("scanning user: %w", err)
		}
		u.JoinDate = joinDate.Format(time.RFC3339)
		users = append(users, u)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating users: %w", err)
	}

	return &searchUsersResponse{Users: users}, nil
}

/* POST /admin/impersonate */

const targetQuery = `SELECT first_name, last_name, email, is_admin FROM "user" WHERE id = $1`

const logImpersonationQuery = `
INSERT INTO admin_impersonation_log(admin_id, target_user_id, reason)
VALUES ($1, $2, $3) RETURNING id
`

type impersonateBody struct {
	UserId int    `json:"user_id"`
	Reason string `json:"reason"`
}

type impersonateResponse struct {
	Token     string  `json:"token"`
	UserId    int     `json:"user_id"`
	FullName  string  `json:"full_name"`
	Email     *string `json:"email"`
	SessionId int     `json:"session_id"`
	ExpiresIn int     `json:"expires_in"`
}

func HandleImpersonate(tx *db.Tx, r *http.Request) (interface{}, error) {
	adminId, err := requireAdmin(tx, r)
	if err != nil {
		return nil, err
	}

	var body impersonateBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("decoding body: %w", err))
	}

	if body.UserId == adminId {
		return nil, serde.WithStatus(http.StatusBadRequest, serde.WithEnum(
			serde.InvalidImpersonationTarget, fmt.Errorf("cannot impersonate yourself"),
		))
	}

	var firstName, lastName string
	var email *string
	var targetIsAdmin bool
	err = tx.QueryRow(targetQuery, body.UserId).Scan(&firstName, &lastName, &email, &targetIsAdmin)
	if err != nil {
		return nil, serde.WithStatus(http.StatusNotFound, serde.WithEnum(
			serde.InvalidImpersonationTarget,
			fmt.Errorf("loading impersonation target %d: %w", body.UserId, err),
		))
	}

	// Admins are off limits to each other. Impersonating one would inherit
	// their console access and let an admin act with another's identity, which
	// is exactly what the audit log is supposed to prevent.
	if targetIsAdmin {
		return nil, serde.WithStatus(http.StatusForbidden, serde.WithEnum(
			serde.InvalidImpersonationTarget, fmt.Errorf("cannot impersonate another admin"),
		))
	}

	reason := strings.TrimSpace(body.Reason)
	if len(reason) > 500 {
		reason = reason[:500]
	}
	var reasonArg *string
	if reason != "" {
		reasonArg = &reason
	}

	// Recorded before the token exists: see the package comment.
	var sessionId int
	err = tx.QueryRow(logImpersonationQuery, adminId, body.UserId, reasonArg).Scan(&sessionId)
	if err != nil {
		return nil, fmt.Errorf("recording impersonation: %w", err)
	}

	token, err := serde.NewImpersonationJwt(body.UserId, adminId)
	if err != nil {
		return nil, fmt.Errorf("signing impersonation jwt: %w", err)
	}

	return &impersonateResponse{
		Token:     token,
		UserId:    body.UserId,
		FullName:  firstName + " " + lastName,
		Email:     email,
		SessionId: sessionId,
		ExpiresIn: int(serde.ImpersonationExpirationPeriod.Seconds()),
	}, nil
}

/* POST /admin/impersonate/stop */

const endImpersonationQuery = `
UPDATE admin_impersonation_log
SET ended_at = NOW()
WHERE id = $1 AND admin_id = $2 AND ended_at IS NULL
`

type stopImpersonatingBody struct {
	SessionId int `json:"session_id"`
}

type stopImpersonatingResponse struct {
	Token  string `json:"token"`
	UserId int    `json:"user_id"`
}

// HandleStopImpersonating exchanges an impersonation token for a fresh token
// for the admin behind it. The admin's identity is taken from the signed `imp`
// claim, so exiting never depends on the client having held on to the original
// token — closing the tab mid-session does not strand the account.
func HandleStopImpersonating(tx *db.Tx, r *http.Request) (interface{}, error) {
	claims, err := serde.ClaimsFromRequest(r)
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, fmt.Errorf("extracting claims: %w", err))
	}

	if !claims.Impersonating() {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("not an impersonation session"))
	}

	adminId := claims.Impersonator

	// Re-check the flag: an admin demoted mid-session should not be handed a
	// working token for their old account.
	var isAdmin bool
	if err := tx.QueryRow(isAdminQuery, adminId).Scan(&isAdmin); err != nil || !isAdmin {
		return nil, serde.WithStatus(http.StatusForbidden, serde.WithEnum(
			serde.NotAdmin, fmt.Errorf("impersonator %d is no longer an admin", adminId),
		))
	}

	var body stopImpersonatingBody
	// A missing or malformed body is not fatal — closing out the audit row is
	// best-effort, and refusing to return the admin's token over it would
	// leave them stuck as the user.
	json.NewDecoder(r.Body).Decode(&body)
	if body.SessionId != 0 {
		if _, err := tx.Exec(endImpersonationQuery, body.SessionId, adminId); err != nil {
			return nil, fmt.Errorf("closing impersonation record: %w", err)
		}
	}

	token, err := serde.NewSignedJwt(adminId)
	if err != nil {
		return nil, fmt.Errorf("signing jwt: %w", err)
	}

	return &stopImpersonatingResponse{Token: token, UserId: adminId}, nil
}

/* GET /admin/impersonation-log */

const impersonationLogQuery = `
SELECT
  l.id,
  l.admin_id,
  a.full_name,
  l.target_user_id,
  t.full_name,
  l.reason,
  l.started_at,
  l.ended_at
FROM admin_impersonation_log l
  JOIN "user" a ON a.id = l.admin_id
  JOIN "user" t ON t.id = l.target_user_id
ORDER BY l.started_at DESC
LIMIT $1
`

const logLimit = 100

type impersonationLogEntry struct {
	Id             int     `json:"id"`
	AdminId        int     `json:"admin_id"`
	AdminName      string  `json:"admin_name"`
	TargetUserId   int     `json:"target_user_id"`
	TargetUserName string  `json:"target_user_name"`
	Reason         *string `json:"reason"`
	StartedAt      string  `json:"started_at"`
	EndedAt        *string `json:"ended_at"`
}

type impersonationLogResponse struct {
	Entries []impersonationLogEntry `json:"entries"`
}

// HandleImpersonationLog returns the audit trail for every admin, not just the
// caller: mutual visibility is the point of keeping it.
func HandleImpersonationLog(tx *db.Tx, r *http.Request) (interface{}, error) {
	if _, err := requireAdmin(tx, r); err != nil {
		return nil, err
	}

	rows, err := tx.Query(impersonationLogQuery, logLimit)
	if err != nil {
		return nil, fmt.Errorf("loading impersonation log: %w", err)
	}
	defer rows.Close()

	entries := []impersonationLogEntry{}
	for rows.Next() {
		var e impersonationLogEntry
		var startedAt time.Time
		var endedAt *time.Time
		err := rows.Scan(
			&e.Id, &e.AdminId, &e.AdminName, &e.TargetUserId, &e.TargetUserName,
			&e.Reason, &startedAt, &endedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("scanning log entry: %w", err)
		}
		e.StartedAt = startedAt.Format(time.RFC3339)
		if endedAt != nil {
			formatted := endedAt.Format(time.RFC3339)
			e.EndedAt = &formatted
		}
		entries = append(entries, e)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating log: %w", err)
	}

	return &impersonationLogResponse{Entries: entries}, nil
}
