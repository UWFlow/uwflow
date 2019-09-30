package section

import (
	"fmt"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/db"
)

const InsertSectionPrelude = `
DROP TABLE IF EXISTS _course_selection_delta;

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

const InsertSectionQuery = `
UPDATE course_section SET
  course_id = c.id,
  section = delta.section,
  campus = delta.campus,
  enrollment_capacity = delta.enrollment_capacity,
  enrollment_total = delta.enrollment_total
FROM _course_section_delta delta
  JOIN course c ON c.code = delta.course_code
WHERE course_section.class_number = delta.class_number
  AND course_section.term = delta.term;

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
WHERE cs.id IS NULL;

DROP TABLE _course_section_delta;
`

func InsertAllSections(conn *db.Conn, sections []Section) error {
	tx, err := conn.Begin()
	if err != nil {
		return fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(InsertSectionPrelude)
	if err != nil {
		return fmt.Errorf("failed to create temporary table: %w", err)
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
		return fmt.Errorf("failed to copy data: %w", err)
	}

	_, err = tx.Exec(InsertSectionQuery)
	if err != nil {
		return fmt.Errorf("failed to apply update: %w", err)
	}

	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}

const InsertMeetingPrelude = `
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

const InsertMeetingQuery = `
-- No use trying to keep track of what's being updated:
-- nothing references meetings (no primary key),
-- so we might as well overwrite them fully.
TRUNCATE section_meeting;

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
    ON p.code = d.prof_code;

DROP TABLE _section_meeting_delta;
`

func InsertAllMeetings(conn *db.Conn, meetings []Meeting) error {
	tx, err := conn.Begin()
	if err != nil {
		return fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(InsertMeetingPrelude)
	if err != nil {
		return fmt.Errorf("failed to create temporary table: %w", err)
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
		return fmt.Errorf("failed to copy data: %w", err)
	}

	_, err = tx.Exec(InsertMeetingQuery)
	if err != nil {
		return fmt.Errorf("failed to apply update: %w", err)
	}

	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}

const InsertProfPrelude = `
DROP TABLE IF EXISTS _prof_delta;

CREATE TEMPORARY TABLE _prof_delta(
  name TEXT NOT NULL,
  code TEXT NOT NULL
);
`

const InsertProfQuery = `
INSERT INTO prof(name, code)
SELECT d.name, d.code
FROM _prof_delta d
  LEFT JOIN prof p ON p.code = d.code
WHERE p.id IS NULL;

DROP TABLE _prof_delta;
`

func InsertAllProfs(conn *db.Conn, profs []Prof) error {
	tx, err := conn.Begin()
	if err != nil {
		return fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(InsertProfPrelude)
	if err != nil {
		return fmt.Errorf("failed to create temporary table: %w", err)
	}

	preparedProfs := make([][]interface{}, len(profs))
	for i, prof := range profs {
		preparedProfs[i] = []interface{}{prof.Name, prof.Code}
	}

	_, err = tx.CopyFrom("_prof_delta", []string{"name", "code"}, preparedProfs)
	if err != nil {
		return fmt.Errorf("failed to copy data: %w", err)
	}

	_, err = tx.Exec(InsertProfQuery)
	if err != nil {
		return fmt.Errorf("failed to apply update: %w", err)
	}

	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}
