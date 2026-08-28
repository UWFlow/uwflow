// Package group backs the Shared Classes feature: small groups whose members
// compare the schedules Flow already stores and see which sections they share.
// Reads and writes go through these REST endpoints (like auth and parse) rather
// than Hasura, so the privacy rules (server-side email resolution, no account
// enumeration) live in one place.
package group

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"flow/api/serde"
	"flow/common/db"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
)

// groupId reads and validates the {id} path parameter.
func groupId(r *http.Request) (int, error) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		return 0, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("invalid group id: %w", err))
	}
	return id, nil
}

// decode reads a JSON request body into dst, returning a 400 on malformed input.
func decode(r *http.Request, dst interface{}) error {
	if err := json.NewDecoder(r.Body).Decode(dst); err != nil {
		return serde.WithStatus(http.StatusBadRequest, fmt.Errorf("invalid request body: %w", err))
	}
	return nil
}

// Create makes a new group with the caller as its first member.
func Create(tx *db.Tx, r *http.Request) (interface{}, error) {
	userId, err := serde.UserIdFromRequest(r)
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, err)
	}

	var body struct {
		Name string `json:"name"`
	}
	if err := decode(r, &body); err != nil {
		return nil, err
	}
	name := strings.TrimSpace(body.Name)
	if name == "" || len(name) > 80 {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("group name must be 1 to 80 characters"))
	}

	var id int
	err = tx.QueryRow(`
		INSERT INTO shared_group (name, created_by) VALUES ($1, $2) RETURNING id
	`, name, userId).Scan(&id)
	if err != nil {
		return nil, fmt.Errorf("creating group: %w", err)
	}
	_, err = tx.Exec(`
		INSERT INTO shared_group_member (group_id, user_id, status)
		VALUES ($1, $2, 'member')
	`, id, userId)
	if err != nil {
		return nil, fmt.Errorf("adding creator as member: %w", err)
	}

	return map[string]interface{}{"id": id, "name": name}, nil
}

type groupSummary struct {
	Id          int    `json:"id"`
	Name        string `json:"name"`
	Status      string `json:"status"`
	MemberCount int    `json:"member_count"`
}

// List returns every group the caller belongs to or has been invited into.
func List(tx *db.Tx, r *http.Request) (interface{}, error) {
	userId, err := serde.UserIdFromRequest(r)
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, err)
	}

	rows, err := tx.Query(`
		SELECT g.id, g.name, m.status,
			(SELECT COUNT(*) FROM shared_group_member mm
			 WHERE mm.group_id = g.id AND mm.status = 'member') AS member_count
		FROM shared_group g
		JOIN shared_group_member m ON m.group_id = g.id
		WHERE m.user_id = $1
		ORDER BY g.created_at DESC
	`, userId)
	if err != nil {
		return nil, fmt.Errorf("listing groups: %w", err)
	}
	defer rows.Close()

	groups := []groupSummary{}
	for rows.Next() {
		var g groupSummary
		if err := rows.Scan(&g.Id, &g.Name, &g.Status, &g.MemberCount); err != nil {
			return nil, fmt.Errorf("scanning group: %w", err)
		}
		groups = append(groups, g)
	}
	return map[string]interface{}{"groups": groups}, rows.Err()
}

type memberInfo struct {
	UserId int    `json:"user_id"`
	Name   string `json:"name"`
	Status string `json:"status"`
}

type meetingInfo struct {
	Days         []string `json:"days"`
	StartSeconds *int     `json:"start_seconds"`
	EndSeconds   *int     `json:"end_seconds"`
	Location     *string  `json:"location"`
}

type sharedClass struct {
	SectionId   int           `json:"section_id"`
	CourseCode  string        `json:"course_code"`
	CourseName  string        `json:"course_name"`
	SectionName string        `json:"section_name"`
	TermId      int           `json:"term_id"`
	Members     []memberInfo  `json:"members"`
	Meetings    []meetingInfo `json:"meetings"`
}

// Get returns a group's members (pending members included) and the classes
// shared by two or more confirmed members. Only members may read a group.
func Get(tx *db.Tx, r *http.Request) (interface{}, error) {
	userId, err := serde.UserIdFromRequest(r)
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, err)
	}
	gid, err := groupId(r)
	if err != nil {
		return nil, err
	}

	isMember, isCreator, err := isGroupMember(tx, gid, userId)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, serde.WithStatus(http.StatusForbidden, fmt.Errorf("not a member of this group"))
	}

	var name string
	if err := tx.QueryRow(`SELECT name FROM shared_group WHERE id = $1`, gid).Scan(&name); err != nil {
		return nil, fmt.Errorf("loading group: %w", err)
	}

	members, err := groupMembers(tx, gid)
	if err != nil {
		return nil, err
	}
	classes, err := sharedClasses(tx, gid)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"id":             gid,
		"name":           name,
		"is_creator":     isCreator,
		"members":        members,
		"shared_classes": classes,
	}, nil
}

// isGroupMember reports confirmed membership and whether the user created the
// group. Used as the read/write gate for a group.
func isGroupMember(tx *db.Tx, gid, userId int) (isMember, isCreator bool, err error) {
	var createdBy int
	var status *string
	err = tx.QueryRow(`
		SELECT g.created_by, m.status
		FROM shared_group g
		LEFT JOIN shared_group_member m
			ON m.group_id = g.id AND m.user_id = $2
		WHERE g.id = $1
	`, gid, userId).Scan(&createdBy, &status)
	if err != nil {
		return false, false, fmt.Errorf("checking membership: %w", err)
	}
	isMember = status != nil && *status == "member"
	isCreator = createdBy == userId
	return isMember, isCreator, nil
}

func groupMembers(tx *db.Tx, gid int) ([]memberInfo, error) {
	rows, err := tx.Query(`
		SELECT m.user_id, u.first_name, u.last_name, m.status
		FROM shared_group_member m
		JOIN "user" u ON u.id = m.user_id
		WHERE m.group_id = $1
		ORDER BY m.created_at
	`, gid)
	if err != nil {
		return nil, fmt.Errorf("loading members: %w", err)
	}
	defer rows.Close()

	members := []memberInfo{}
	for rows.Next() {
		var m memberInfo
		var first, last *string
		if err := rows.Scan(&m.UserId, &first, &last, &m.Status); err != nil {
			return nil, fmt.Errorf("scanning member: %w", err)
		}
		m.Name = fullName(first, last)
		members = append(members, m)
	}
	return members, rows.Err()
}

// sharedClasses computes, for a group, each section held by two or more
// confirmed members, with the members in it and its meeting times.
func sharedClasses(tx *db.Tx, gid int) ([]sharedClass, error) {
	rows, err := tx.Query(`
		WITH member_sections AS (
			SELECT us.section_id, us.user_id, u.first_name, u.last_name
			FROM shared_group_member m
			JOIN user_schedule us ON us.user_id = m.user_id
			JOIN "user" u ON u.id = us.user_id
			WHERE m.group_id = $1 AND m.status = 'member'
		),
		shared AS (
			SELECT section_id FROM member_sections
			GROUP BY section_id
			HAVING COUNT(DISTINCT user_id) >= 2
		)
		SELECT ms.section_id, c.code, c.name, cs.section_name, cs.term_id,
			ms.user_id, ms.first_name, ms.last_name
		FROM member_sections ms
		JOIN shared s ON s.section_id = ms.section_id
		JOIN course_section cs ON cs.id = ms.section_id
		JOIN course c ON c.id = cs.course_id
		ORDER BY c.code, cs.section_name, ms.user_id
	`, gid)
	if err != nil {
		return nil, fmt.Errorf("computing shared classes: %w", err)
	}
	defer rows.Close()

	order := []int{}
	byId := map[int]*sharedClass{}
	for rows.Next() {
		var sectionId, termId, memberId int
		var code, name, sectionName string
		var first, last *string
		if err := rows.Scan(&sectionId, &code, &name, &sectionName, &termId, &memberId, &first, &last); err != nil {
			return nil, fmt.Errorf("scanning shared class: %w", err)
		}
		sc, ok := byId[sectionId]
		if !ok {
			sc = &sharedClass{
				SectionId:   sectionId,
				CourseCode:  code,
				CourseName:  name,
				SectionName: sectionName,
				TermId:      termId,
				Members:     []memberInfo{},
				Meetings:    []meetingInfo{},
			}
			byId[sectionId] = sc
			order = append(order, sectionId)
		}
		sc.Members = append(sc.Members, memberInfo{UserId: memberId, Name: fullName(first, last), Status: "member"})
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	if len(order) == 0 {
		return []sharedClass{}, nil
	}

	if err := attachMeetings(tx, order, byId); err != nil {
		return nil, err
	}

	classes := make([]sharedClass, 0, len(order))
	for _, id := range order {
		classes = append(classes, *byId[id])
	}
	return classes, nil
}

func attachMeetings(tx *db.Tx, sectionIds []int, byId map[int]*sharedClass) error {
	rows, err := tx.Query(`
		SELECT section_id, days, start_seconds, end_seconds, location
		FROM section_meeting
		WHERE section_id = ANY($1) AND NOT is_cancelled
		ORDER BY section_id, start_seconds
	`, sectionIds)
	if err != nil {
		return fmt.Errorf("loading meetings: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var sectionId int
		var meeting meetingInfo
		if err := rows.Scan(&sectionId, &meeting.Days, &meeting.StartSeconds, &meeting.EndSeconds, &meeting.Location); err != nil {
			return fmt.Errorf("scanning meeting: %w", err)
		}
		if sc, ok := byId[sectionId]; ok {
			sc.Meetings = append(sc.Meetings, meeting)
		}
	}
	return rows.Err()
}

// Invite resolves an email to a Flow account and adds that person as a pending
// member. It returns "sent" on success and "not_found" when no account uses
// that email, so the inviter learns whether the invite reached anyone.
func Invite(tx *db.Tx, r *http.Request) (interface{}, error) {
	userId, err := serde.UserIdFromRequest(r)
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, err)
	}
	gid, err := groupId(r)
	if err != nil {
		return nil, err
	}
	isMember, _, err := isGroupMember(tx, gid, userId)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, serde.WithStatus(http.StatusForbidden, fmt.Errorf("not a member of this group"))
	}

	var body struct {
		Email string `json:"email"`
	}
	if err := decode(r, &body); err != nil {
		return nil, err
	}
	email := strings.ToLower(strings.TrimSpace(body.Email))
	if email == "" || !strings.Contains(email, "@") {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("enter a valid email"))
	}

	sent := map[string]interface{}{"status": "sent"}

	// Resolve the email to an account first. Invites only go to people who
	// already have a Flow account, so if there is no match we report it back
	// instead of creating a pending member for no one. Inviting an email with
	// no account (and emailing them to sign up) is possible future work, not
	// built here.
	var targetId int
	err = tx.QueryRow(`SELECT id FROM "user" WHERE LOWER(email) = $1`, email).Scan(&targetId)
	if errors.Is(err, pgx.ErrNoRows) {
		return map[string]interface{}{"status": "not_found"}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("looking up invited account: %w", err)
	}

	// A pending shared_group_member row is the invite: the person accepts by
	// becoming 'member', or the row is deleted on decline. Existing membership
	// is left as is (never demotes a confirmed member back to pending).
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

// Respond accepts or declines a pending invite.
func Respond(tx *db.Tx, r *http.Request) (interface{}, error) {
	userId, err := serde.UserIdFromRequest(r)
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, err)
	}
	gid, err := groupId(r)
	if err != nil {
		return nil, err
	}

	var body struct {
		Accept bool `json:"accept"`
	}
	if err := decode(r, &body); err != nil {
		return nil, err
	}

	if body.Accept {
		tag, err := tx.Exec(`
			UPDATE shared_group_member SET status = 'member'
			WHERE group_id = $1 AND user_id = $2 AND status = 'pending'
		`, gid, userId)
		if err != nil {
			return nil, fmt.Errorf("accepting invite: %w", err)
		}
		if tag.RowsAffected() == 0 {
			return nil, serde.WithStatus(http.StatusNotFound, fmt.Errorf("no pending invite for this group"))
		}
		return map[string]interface{}{"status": "member"}, nil
	}

	// Decline: just drop the pending membership row.
	_, err = tx.Exec(`
		DELETE FROM shared_group_member WHERE group_id = $1 AND user_id = $2 AND status = 'pending'
	`, gid, userId)
	if err != nil {
		return nil, fmt.Errorf("declining invite: %w", err)
	}
	return map[string]interface{}{"status": "declined"}, nil
}

// Leave removes the caller from a group.
func Leave(tx *db.Tx, r *http.Request) (interface{}, error) {
	userId, err := serde.UserIdFromRequest(r)
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, err)
	}
	gid, err := groupId(r)
	if err != nil {
		return nil, err
	}
	_, err = tx.Exec(`
		DELETE FROM shared_group_member WHERE group_id = $1 AND user_id = $2
	`, gid, userId)
	if err != nil {
		return nil, fmt.Errorf("leaving group: %w", err)
	}
	return map[string]interface{}{"status": "left"}, nil
}

// Delete removes a group entirely. Only its creator may do this.
func Delete(tx *db.Tx, r *http.Request) (interface{}, error) {
	userId, err := serde.UserIdFromRequest(r)
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, err)
	}
	gid, err := groupId(r)
	if err != nil {
		return nil, err
	}
	tag, err := tx.Exec(`
		DELETE FROM shared_group WHERE id = $1 AND created_by = $2
	`, gid, userId)
	if err != nil {
		return nil, fmt.Errorf("deleting group: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return nil, serde.WithStatus(http.StatusForbidden, fmt.Errorf("only the creator can delete this group"))
	}
	return map[string]interface{}{"status": "deleted"}, nil
}

func fullName(first, last *string) string {
	parts := []string{}
	if first != nil && *first != "" {
		parts = append(parts, *first)
	}
	if last != nil && *last != "" {
		parts = append(parts, *last)
	}
	return strings.Join(parts, " ")
}
