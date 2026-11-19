package prof

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"unicode/utf8"

	"flow/api/serde"
	"flow/common/db"

	"github.com/jackc/pgx/v5"
)

const (
	minNameLength = 2
	maxNameLength = 100
	// Each new submission costs a Claude request, so cap them per user.
	maxSubmissionsPerDay = 5
	maxMatches           = 5
)

// Letters and the punctuation found in names. Excluding everything else also
// keeps Slack mentions, links, and markup out of submissions.
var namePattern = regexp.MustCompile(`^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$`)

type submitRequest struct {
	Name     string `json:"name"`
	CourseId int    `json:"course_id"`
}

// normalizeName collapses whitespace and rejects anything that is not a name.
func normalizeName(raw string) (string, error) {
	name := strings.Join(strings.Fields(raw), " ")
	length := utf8.RuneCountInString(name)
	if length < minNameLength || length > maxNameLength || !namePattern.MatchString(name) {
		return "", serde.WithStatus(
			http.StatusBadRequest,
			serde.WithEnum(serde.InvalidProfName, fmt.Errorf("invalid prof name")),
		)
	}
	return name, nil
}

// Submit records a professor missing from the review box and, the first time
// that prof is reported for the course, sends it to Slack for verification.
func Submit(conn *db.Conn, w http.ResponseWriter, r *http.Request) error {
	userId, err := serde.UserIdFromRequest(r)
	if err != nil {
		return serde.WithStatus(http.StatusUnauthorized, err)
	}

	var body submitRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		return serde.WithStatus(http.StatusBadRequest, fmt.Errorf("decoding request: %w", err))
	}
	name, err := normalizeName(body.Name)
	if err != nil {
		return err
	}

	tx, err := conn.BeginWithContext(r.Context())
	if err != nil {
		return fmt.Errorf("opening transaction: %w", err)
	}
	defer tx.Rollback()

	sub, isNew, err := insertSubmission(tx, userId, body.CourseId, name)
	if err != nil {
		return err
	}
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("committing: %w", err)
	}

	// Verification outlives this request, so it runs on its own context.
	if isNew {
		go notify(sub)
	}

	w.WriteHeader(http.StatusNoContent)
	return nil
}

func insertSubmission(tx *db.Tx, userId, courseId int, name string) (submission, bool, error) {
	sub := submission{name: name}

	var exists bool
	err := tx.QueryRow(`
		SELECT EXISTS(SELECT FROM prof WHERE LOWER(name) = LOWER($1))
			OR EXISTS(SELECT FROM prof_alias WHERE LOWER(name) = LOWER($1))
	`, name).Scan(&exists)
	if err != nil {
		return sub, false, fmt.Errorf("checking existing profs: %w", err)
	}
	if exists {
		return sub, false, serde.WithStatus(
			http.StatusConflict,
			serde.WithEnum(serde.ProfAlreadyExists, fmt.Errorf("prof already exists")),
		)
	}

	err = tx.QueryRow(`SELECT code, name FROM course WHERE id = $1`, courseId).
		Scan(&sub.courseCode, &sub.courseName)
	if errors.Is(err, pgx.ErrNoRows) {
		return sub, false, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("no course %d", courseId))
	}
	if err != nil {
		return sub, false, fmt.Errorf("reading course: %w", err)
	}

	var recent int
	err = tx.QueryRow(`
		SELECT COUNT(*) FROM prof_submission
		WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 day'
	`, userId).Scan(&recent)
	if err != nil {
		return sub, false, fmt.Errorf("counting submissions: %w", err)
	}
	if recent >= maxSubmissionsPerDay {
		return sub, false, serde.WithStatus(
			http.StatusTooManyRequests,
			serde.WithEnum(serde.TooManyProfSubmissions, fmt.Errorf("too many prof submissions")),
		)
	}

	tag, err := tx.Exec(`
		INSERT INTO prof_submission (name, course_id, user_id) VALUES ($1, $2, $3)
		ON CONFLICT (LOWER(name), course_id) DO NOTHING
	`, name, courseId, userId)
	if err != nil {
		return sub, false, fmt.Errorf("inserting submission: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return sub, false, nil
	}

	sub.matches, err = similarProfs(tx, name)
	if err != nil {
		return sub, false, err
	}
	return sub, true, nil
}

// similarProfs finds existing profs sharing the submission's last name, so a
// reviewer can spot a duplicate such as a missing middle initial.
func similarProfs(tx *db.Tx, name string) ([]string, error) {
	parts := strings.Fields(name)
	rows, err := tx.Query(`
		SELECT name FROM (
			SELECT name FROM prof UNION SELECT name FROM prof_alias
		) names
		WHERE name ILIKE '%' || $1 || '%'
		ORDER BY name
		LIMIT $2
	`, parts[len(parts)-1], maxMatches)
	if err != nil {
		return nil, fmt.Errorf("finding similar profs: %w", err)
	}
	defer rows.Close()

	var matches []string
	for rows.Next() {
		var match string
		if err := rows.Scan(&match); err != nil {
			return nil, fmt.Errorf("reading similar prof: %w", err)
		}
		matches = append(matches, match)
	}
	return matches, rows.Err()
}
