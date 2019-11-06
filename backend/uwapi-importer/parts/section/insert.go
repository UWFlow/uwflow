package section

import (
	"fmt"
	"net/smtp"
	"os"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/db"
)

const SetupSectionQuery = `
DROP TABLE IF EXISTS _course_section_delta;

CREATE TEMPORARY TABLE _course_section_delta(
  class_number INT NOT NULL,
  course_code TEXT NOT NULL,
  section TEXT NOT NULL,
  campus TEXT NOT NULL,
  term INT NOT NULL,
  enrollment_capacity INT NOT NULL,
  enrollment_total INT NOT NULL
);
`

const UpdateSectionQuery = `
UPDATE course_section SET
  course_id = c.id,
  section = delta.section,
  campus = delta.campus,
  enrollment_capacity = delta.enrollment_capacity,
  enrollment_total = delta.enrollment_total
FROM _course_section_delta delta
  JOIN course c ON c.code = delta.course_code
WHERE course_section.class_number = delta.class_number
  AND course_section.term = delta.term
`

const InsertSectionQuery = `
INSERT INTO course_section(
  class_number, course_id, section, campus,
  term, enrollment_capacity, enrollment_total
)
SELECT
  d.class_number, c.id, d.section, d.campus,
  d.term, d.enrollment_capacity, d.enrollment_total
FROM _course_section_delta d
  JOIN course c ON c.code = d.course_code
  LEFT JOIN course_section cs
   ON cs.class_number = d.class_number
  AND cs.term = d.term
WHERE cs.id IS NULL
`

const GetNewlyAvailableSectionsQuery = `
SELECT 
  c.id
FROM course_section c
  LEFT JOIN _course_section_delta d
	ON c.class_number = d.class_number
   AND c.term = d.term
WHERE d.enrollment_total < d.enrollment_capacity
  AND c.enrollment_total >= c.enrollment_capacity;
`

const TeardownSectionQuery = `DROP TABLE _course_section_delta`

func SendNotificationEmail(to string, subject string, body string) error {
	// Set up authentication information for Gmail server
	from := os.Getenv("GMAIL_USER")
	auth := smtp.PlainAuth("", from, os.Getenv("GMAIL_APP_PASSWORD"), "smtp.gmail.com")
	msg := []byte(fmt.Sprintf("To: %s\r\n", to) +
		fmt.Sprintf("Subject: %s\r\n", subject) +
		"\r\n" +
		fmt.Sprintf("%s\r\n", body))
	err := smtp.SendMail("smtp.gmail.com:587", auth, from, []string{to}, msg)
	if err != nil {
		return fmt.Errorf("failed to send email to %w", to)
	}
	return nil
}

func InsertAllSections(conn *db.Conn, sections []Section) (*db.Result, error) {
	var result db.Result

	tx, err := conn.Begin()
	if err != nil {
		return &result, fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(SetupSectionQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to create temporary table: %w", err)
	}

	preparedSections := make([][]interface{}, len(sections))
	for i, section := range sections {
		preparedSections[i] = []interface{}{
			section.ClassNumber, section.CourseCode, section.SectionName, section.Campus,
			section.TermId, section.EnrollmentCapacity, section.EnrollmentTotal,
		}
	}

	_, err = tx.CopyFrom(
		"_course_section_delta",
		[]string{
			"class_number", "course_code", "section", "campus",
			"term", "enrollment_capacity", "enrollment_total",
		},
		preparedSections,
	)
	if err != nil {
		return &result, fmt.Errorf("failed to copy data: %w", err)
	}

	rows, err := tx.Query(GetNewlyAvailableSectionsQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to query newly available sections: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var sectionID int
		var courseName, section string
		rows.Scan(&sectionID, &courseName, &section)
		users, err := tx.Query(
			`SELECT u.email, c.name, cs.section
			 FROM section_subscriptions ss
			   LEFT JOIN public.user u ON ss.user_id = u.id
			   LEFT JOIN course_section cs ON ss.section_id = cs.id
			   LEFT JOIN course c ON cs.course_id = c.id
			 WHERE ss.section_id = $1;
			`, sectionID)

		if err != nil {
			return &result, fmt.Errorf("failed to get subscriber emails: %w", err)
		}

		for users.Next() {
			var email string
			users.Scan(&email)
			go SendNotificationEmail(email, fmt.Sprintf("%s: %s", courseName, section), "Body")
		}

		users.Close()
	}

	tag, err := tx.Exec(UpdateSectionQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to apply update: %w", err)
	}
	result.Updated = int(tag.RowsAffected())

	tag, err = tx.Exec(InsertSectionQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to insert: %w", err)
	}
	result.Inserted = int(tag.RowsAffected())

	_, err = tx.Exec(TeardownSectionQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to tear down table: %w", err)
	}

	err = tx.Commit()
	if err != nil {
		return &result, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// We did not exclude any rows deliberately,
	// so the remainder was rejected (most likely no matching course exists).
	result.Rejected = len(sections) - result.Inserted - result.Updated
	return &result, nil
}

const SetupMeetingQuery = `
DROP TABLE IF EXISTS _section_meeting_delta;

CREATE TEMPORARY TABLE _section_meeting_delta(
  class_number INT NOT NULL,
  term INT NOT NULL,
  prof_code TEXT,
  location TEXT,
  start_seconds INT,
  end_seconds INT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days TEXT[] NOT NULL,
  is_cancelled BOOLEAN NOT NULL,
  is_closed BOOLEAN NOT NULL,
  is_tba BOOLEAN NOT NULL
);
`

// No use trying to keep track of what's being updated:
// nothing references meetings (no primary key),
// so we might as well overwrite them fully.
const TruncateMeetingQuery = `TRUNCATE section_meeting`

const InsertMeetingQuery = `
INSERT INTO section_meeting(
  section_id, prof_id,
  location, start_seconds, end_seconds,
  start_date, end_date, days,
  is_cancelled, is_closed, is_tba
)
SELECT
  s.id, p.id,
  d.location, d.start_seconds, d.end_seconds,
  d.start_date, d.end_date, d.days,
  d.is_cancelled, d.is_closed, d.is_tba
FROM _section_meeting_delta d
  -- must have a matching section
  JOIN course_section s
    ON s.class_number = d.class_number
   AND s.term = d.term
  -- may not have a matching prof
  LEFT JOIN prof p
    ON p.code = d.prof_code
`

const TeardownMeetingQuery = `DROP TABLE _section_meeting_delta`

func InsertAllMeetings(conn *db.Conn, meetings []Meeting) (*db.Result, error) {
	var result db.Result

	tx, err := conn.Begin()
	if err != nil {
		return &result, fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(SetupMeetingQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to create temporary table: %w", err)
	}

	preparedMeetings := make([][]interface{}, len(meetings))
	for i, meeting := range meetings {
		preparedMeetings[i] = []interface{}{
			meeting.ClassNumber, meeting.TermId, meeting.ProfCode,
			meeting.Location, meeting.StartSeconds, meeting.EndSeconds,
			meeting.StartDate, meeting.EndDate, meeting.Days,
			meeting.IsCancelled, meeting.IsClosed, meeting.IsTba,
		}
	}

	_, err = tx.CopyFrom(
		"_section_meeting_delta",
		[]string{
			"class_number", "term", "prof_code",
			"location", "start_seconds", "end_seconds",
			"start_date", "end_date", "days",
			"is_cancelled", "is_closed", "is_tba",
		},
		preparedMeetings,
	)
	if err != nil {
		return &result, fmt.Errorf("failed to copy data: %w", err)
	}

	_, err = tx.Exec(TruncateMeetingQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to truncate: %w", err)
	}

	tag, err := tx.Exec(InsertMeetingQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to insert: %w", err)
	}
	result.Inserted = int(tag.RowsAffected())

	_, err = tx.Exec(TeardownMeetingQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to tear down table: %w", err)
	}

	err = tx.Commit()
	if err != nil {
		return &result, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Like with sections, we did not deliberately exclude anything
	result.Rejected = len(meetings) - result.Inserted
	return &result, nil
}

const SetupProfQuery = `
DROP TABLE IF EXISTS _prof_delta;

CREATE TEMPORARY TABLE _prof_delta(
  name TEXT NOT NULL,
  code TEXT NOT NULL
);
`

// Profs have nothing to update: name and code are their identifiers
const InsertProfQuery = `
INSERT INTO prof(name, code)
SELECT d.name, d.code
FROM _prof_delta d
  LEFT JOIN prof p ON p.code = d.code
WHERE p.id IS NULL
`

const TeardownProfQuery = `DROP TABLE _prof_delta`

func InsertAllProfs(conn *db.Conn, profs []Prof) (*db.Result, error) {
	var result db.Result

	tx, err := conn.Begin()
	if err != nil {
		return &result, fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(SetupProfQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to create temporary table: %w", err)
	}

	var preparedProfs [][]interface{}
	// Filter duplicates before going to database: this is faster
	seenProfCode := make(map[string]bool)
	for _, prof := range profs {
		if !seenProfCode[prof.Code] {
			preparedProfs = append(preparedProfs, []interface{}{prof.Name, prof.Code})
			seenProfCode[prof.Code] = true
		}
	}

	_, err = tx.CopyFrom("_prof_delta", []string{"name", "code"}, preparedProfs)
	if err != nil {
		return &result, fmt.Errorf("failed to copy data: %w", err)
	}

	tag, err := tx.Exec(InsertProfQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to insert: %w", err)
	}
	result.Inserted = int(tag.RowsAffected())

	_, err = tx.Exec(TeardownProfQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to tear down table: %w", err)
	}

	err = tx.Commit()
	if err != nil {
		return &result, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// In this case, we do deliberately refuse to update existing profs
	// so the remainder after deduplication is untouched.
	result.Untouched = len(preparedProfs) - result.Inserted
	return &result, nil
}
