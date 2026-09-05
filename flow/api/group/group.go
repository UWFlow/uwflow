// Package group backs Shared Classes. CRUD lives in Hasura; Get and Invite
// are here because they need to read across members and keep email lookups opaque.
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
	"flow/common/util"

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
	MemberIds   []int         `json:"member_ids"`
	Meetings    []meetingInfo `json:"meetings"`
}

// Get returns a group's members and its shared classes; only members may read it.
func Get(tx *db.Tx, r *http.Request) (interface{}, error) {
	userId, err := serde.UserIdFromRequest(r)
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, err)
	}
	gid, err := groupId(r)
	if err != nil {
		return nil, err
	}

	name, isMember, isCreator, err := loadGroup(tx, gid, userId)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, serde.WithStatus(http.StatusForbidden, fmt.Errorf("not a member of this group"))
	}

	members, err := groupMembers(tx, gid)
	if err != nil {
		return nil, err
	}
	invited, err := invitedEmails(tx, gid)
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
		"invited_emails": invited,
		"shared_classes": classes,
	}, nil
}

// loadGroup is the read/write gate for every handler: the caller's standing in the group.
func loadGroup(tx *db.Tx, gid, userId int) (name string, isMember, isCreator bool, err error) {
	var createdBy int
	var status *string
	err = tx.QueryRow(`
		SELECT g.name, g.created_by, m.status
		FROM shared_group g
		LEFT JOIN shared_group_member m
			ON m.group_id = g.id AND m.user_id = $2
		WHERE g.id = $1
	`, gid, userId).Scan(&name, &createdBy, &status)
	if errors.Is(err, pgx.ErrNoRows) {
		// No such group: answer like a non-member to avoid id enumeration.
		return "", false, false, nil
	}
	if err != nil {
		return "", false, false, fmt.Errorf("loading group: %w", err)
	}
	isMember = status != nil && *status == "member"
	isCreator = createdBy == userId
	return name, isMember, isCreator, nil
}

// groupMembers dedupes by email, preferring member over pending, since one
// person may hold two accounts (interim, until duplicate accounts are merged).
func groupMembers(tx *db.Tx, gid int) ([]memberInfo, error) {
	rows, err := tx.Query(`
		SELECT m.user_id, u.first_name, u.last_name, m.status, u.email
		FROM shared_group_member m
		JOIN "user" u ON u.id = m.user_id
		WHERE m.group_id = $1
		ORDER BY m.created_at
	`, gid)
	if err != nil {
		return nil, fmt.Errorf("loading members: %w", err)
	}
	defer rows.Close()

	order := []string{}
	byEmail := map[string]memberInfo{}
	for rows.Next() {
		var m memberInfo
		var first, last *string
		var email string
		if err := rows.Scan(&m.UserId, &first, &last, &m.Status, &email); err != nil {
			return nil, fmt.Errorf("scanning member: %w", err)
		}
		m.Name = fullName(first, last)
		email = strings.ToLower(email)

		existing, seen := byEmail[email]
		if !seen {
			order = append(order, email)
			byEmail[email] = m
			continue
		}
		if existing.Status != "member" && m.Status == "member" {
			byEmail[email] = m
		}
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	members := make([]memberInfo, 0, len(order))
	for _, email := range order {
		members = append(members, byEmail[email])
	}
	return members, nil
}

// invitedEmails lists invites with no account yet; resolved invites show up as pending members instead.
func invitedEmails(tx *db.Tx, gid int) ([]string, error) {
	rows, err := tx.Query(`
		SELECT invited_email FROM shared_group_invite
		WHERE group_id = $1
		ORDER BY created_at
	`, gid)
	if err != nil {
		return nil, fmt.Errorf("loading invited emails: %w", err)
	}
	defer rows.Close()

	emails := []string{}
	for rows.Next() {
		var email string
		if err := rows.Scan(&email); err != nil {
			return nil, fmt.Errorf("scanning invited email: %w", err)
		}
		emails = append(emails, email)
	}
	return emails, rows.Err()
}

// sharedClasses returns each section held by two or more confirmed members,
// with member ids (the caller already has names, from "members").
func sharedClasses(tx *db.Tx, gid int) ([]sharedClass, error) {
	// >= term rather than = : parse already accepts next term's schedules.
	rows, err := tx.Query(`
		WITH member_sections AS (
			SELECT us.section_id, us.user_id,
				cs.course_id, cs.section_name, cs.term_id
			FROM shared_group_member m
			JOIN user_schedule us ON us.user_id = m.user_id
			JOIN course_section cs ON cs.id = us.section_id
			WHERE m.group_id = $1 AND m.status = 'member' AND cs.term_id >= $2
		),
		shared AS (
			SELECT section_id FROM member_sections
			GROUP BY section_id
			HAVING COUNT(DISTINCT user_id) >= 2
		)
		SELECT ms.section_id, c.code, c.name, ms.section_name, ms.term_id,
			ms.user_id
		FROM member_sections ms
		JOIN shared s ON s.section_id = ms.section_id
		JOIN course c ON c.id = ms.course_id
		ORDER BY ms.term_id, c.code, ms.section_name, ms.user_id
	`, gid, util.CurrentTermId())
	if err != nil {
		return nil, fmt.Errorf("computing shared classes: %w", err)
	}
	defer rows.Close()

	order := []int{}
	byId := map[int]*sharedClass{}
	for rows.Next() {
		var sectionId, termId, memberId int
		var code, name, sectionName string
		if err := rows.Scan(&sectionId, &code, &name, &sectionName, &termId, &memberId); err != nil {
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
				MemberIds:   []int{},
				Meetings:    []meetingInfo{},
			}
			byId[sectionId] = sc
			order = append(order, sectionId)
		}
		sc.MemberIds = append(sc.MemberIds, memberId)
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

// Invite adds every account matching the email as a pending member and
// always responds "sent", so it can't be used to probe which emails exist.
func Invite(tx *db.Tx, r *http.Request) (interface{}, error) {
	userId, err := serde.UserIdFromRequest(r)
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, err)
	}
	gid, err := groupId(r)
	if err != nil {
		return nil, err
	}
	_, isMember, _, err := loadGroup(tx, gid, userId)
	if err != nil {
		return nil, err
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

	rows, err := tx.Query(`SELECT id FROM "user" WHERE LOWER(email) = $1`, email)
	if err != nil {
		return nil, fmt.Errorf("resolving invited accounts: %w", err)
	}
	defer rows.Close()

	targetIds := []int{}
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("scanning invited account: %w", err)
		}
		targetIds = append(targetIds, id)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("resolving invited accounts: %w", err)
	}
	if len(targetIds) == 0 {
		// No matching account; emailing non-users isn't wired up yet.
		return sent, nil
	}

	// A pending row is the invite; existing membership is never downgraded.
	for _, targetId := range targetIds {
		_, err = tx.Exec(`
			INSERT INTO shared_group_member (group_id, user_id, status)
			VALUES ($1, $2, 'pending')
			ON CONFLICT (group_id, user_id) DO NOTHING
		`, gid, targetId)
		if err != nil {
			return nil, fmt.Errorf("adding pending member: %w", err)
		}
	}
	return sent, nil
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
