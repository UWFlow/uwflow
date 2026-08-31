// Package group backs the Shared Classes feature: small groups whose members
// compare the schedules Flow already stores and see which sections they share.
//
// Group CRUD -- create, list, accept, decline, leave, delete -- is row-level
// work on shared_group and shared_group_member, and lives in Hasura under the
// permissions in that metadata. Only the two operations Hasura cannot express
// are served here:
//
//   - Get, because it reads other members' names and the sections they share.
//     Hasura's "user" select permission is self-only, and widening it, or
//     exposing other members' user_schedule, would hand out every class a
//     member takes rather than the ones the group has in common.
//   - Invite, because resolving an email to an account is the one thing that
//     must not be a query: the lookup happens server-side and the response is
//     uniform, so the endpoint cannot be used to probe which emails exist.
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

// loadGroup reads a group and the caller's standing in it: the read/write gate
// for every handler here, and the group's name for the one that reports it.
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
		// No such group. Answer exactly as we do for a group the caller is not
		// in: a 404 here would tell anyone which group ids exist, which is the
		// enumeration this package exists to avoid.
		return "", false, false, nil
	}
	if err != nil {
		return "", false, false, fmt.Errorf("loading group: %w", err)
	}
	isMember = status != nil && *status == "member"
	isCreator = createdBy == userId
	return name, isMember, isCreator, nil
}

// groupMembers returns one entry per member or pending row, deduped by the
// account's email. Two rows sharing an email is a pre-existing state (see
// Invite): this collapses them back to a single entry, preferring a
// confirmed member over a pending one, so a person with two accounts shows
// up once. The email itself is only a grouping key here and never reaches
// the response. Interim measure, to be removed once duplicate accounts are
// consolidated.
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

// invitedEmails lists addresses invited to a group that have no account behind
// them yet, so members can see an invite is outstanding. Invites to addresses
// that do resolve to an account become pending shared_group_member rows and
// show up in the member list instead.
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

// sharedClasses computes, for a group, each section held by two or more
// confirmed members, with its meeting times and the ids of the members in it.
// Ids rather than names: the caller already has the names, from "members".
func sharedClasses(tx *db.Tx, gid int) ([]sharedClass, error) {
	// user_schedule is only pruned for the term being imported, so it keeps
	// every schedule a member has ever uploaded. Without a term bound a group
	// would see classes shared two years ago alongside this term's. Bound at
	// the current term rather than equal to it because parse accepts schedules
	// for the next term too, and those should show as soon as they are in.
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

// Invite resolves an email to a Flow account server-side and, when possible,
// adds them as a pending member. The response is always "sent" so the endpoint
// cannot be used to probe which emails have accounts.
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

	// Resolve the email to an account. Nothing about the outcome is returned.
	var targetId int
	err = tx.QueryRow(`SELECT id FROM "user" WHERE LOWER(email) = $1`, email).Scan(&targetId)
	if err != nil {
		// No account (or lookup miss): nothing to add yet. Email delivery to
		// non-users is not wired up; that is possible future work.
		return sent, nil
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
