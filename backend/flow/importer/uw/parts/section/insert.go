package section

import (
	"fmt"

	"flow/common/db"
	"flow/common/util"
	"flow/importer/uw/log"
)

const TruncateSectionQuery = `
  TRUNCATE work.course_section_delta
`

const UpdateSectionQuery = `
UPDATE course_section SET
  course_id = c.id,
  section_name = delta.section_name,
  campus = delta.campus,
  enrollment_capacity = delta.enrollment_capacity,
  enrollment_total = delta.enrollment_total,
	updated_at = delta.updated_at
FROM work.course_section_delta delta
  JOIN course c ON c.code = delta.course_code
WHERE course_section.class_number = delta.class_number
  AND course_section.term_id = delta.term_id
`

const InsertSectionQuery = `
INSERT INTO course_section(
  class_number, course_id, section_name, campus,
  term_id, enrollment_capacity, enrollment_total, updated_at
)
SELECT
  d.class_number, c.id, d.section_name, d.campus,
  d.term_id, d.enrollment_capacity, d.enrollment_total, d.updated_at
FROM work.course_section_delta d
  JOIN course c ON c.code = d.course_code
  LEFT JOIN course_section cs
   ON cs.class_number = d.class_number
  AND cs.term_id = d.term_id
WHERE cs.id IS NULL
`

func InsertAllSections(conn *db.Conn, sections []Section) (*log.DbResult, error) {
	var result log.DbResult

	tx, err := conn.Begin()
	if err != nil {
		return &result, fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(TruncateSectionQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to truncate work table: %w", err)
	}

	preparedSections := make([][]interface{}, len(sections))
	for i, section := range sections {
		preparedSections[i] = util.AsSlice(section)
	}

	_, err = tx.CopyFrom(
		db.Identifier{"work", "course_section_delta"},
		util.Fields(sections),
		preparedSections,
	)
	if err != nil {
		return &result, fmt.Errorf("failed to copy data: %w", err)
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

	err = tx.Commit()
	if err != nil {
		return &result, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// We did not exclude any rows deliberately,
	// so the remainder was rejected (most likely no matching course exists).
	result.Rejected = len(sections) - result.Inserted - result.Updated
	return &result, nil
}

// Only delete sections meetings with class numbers imported
// from the UW API so that manually added sections are preserved.
const TruncateMeetingQuery = `
  WITH imported_course_sections AS
  	(SELECT cs.id AS id FROM work.course_section_delta delta
	INNER JOIN course_section cs
	ON delta.class_number = cs.class_number
	AND delta.term_id = cs.term_id)
  DELETE FROM section_meeting sm
	USING imported_course_sections ics
	WHERE ics.id = sm.section_id;
  TRUNCATE work.section_meeting_delta;
`

const InsertMeetingQuery = `
INSERT INTO section_meeting(
  section_id, prof_id,
  location, start_seconds, end_seconds,
  start_date, end_date, days,
  is_cancelled, is_closed, is_tba
)
SELECT
  s.id, COALESCE(pr.prof_id, p.id),
  d.location, d.start_seconds, d.end_seconds,
  d.start_date, d.end_date, d.days,
  d.is_cancelled, d.is_closed, d.is_tba
FROM work.section_meeting_delta d
  -- must have a matching section
  JOIN course_section s
    ON s.class_number = d.class_number
   AND s.term_id = d.term_id
  -- may not have a matching prof
  LEFT JOIN prof_remap pr
    ON pr.code = d.prof_code
  LEFT JOIN prof p
    ON p.code = d.prof_code
`

func InsertAllMeetings(conn *db.Conn, meetings []Meeting) (*log.DbResult, error) {
	var result log.DbResult

	tx, err := conn.Begin()
	if err != nil {
		return &result, fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(TruncateMeetingQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to truncate work table: %w", err)
	}

	preparedMeetings := make([][]interface{}, len(meetings))
	for i, meeting := range meetings {
		preparedMeetings[i] = util.AsSlice(meeting)
	}

	_, err = tx.CopyFrom(
		db.Identifier{"work", "section_meeting_delta"},
		util.Fields(meetings),
		preparedMeetings,
	)
	if err != nil {
		return &result, fmt.Errorf("failed to copy data: %w", err)
	}

	tag, err := tx.Exec(InsertMeetingQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to insert: %w", err)
	}
	result.Inserted = int(tag.RowsAffected())

	err = tx.Commit()
	if err != nil {
		return &result, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Like with sections, we did not deliberately exclude anything
	result.Rejected = len(meetings) - result.Inserted
	return &result, nil
}

const TruncateProfQuery = `TRUNCATE work.prof_delta`

// Profs have nothing to update: name and code are their identifiers
const InsertProfQuery = `
INSERT INTO prof(name, code)
SELECT d.name, d.code
FROM work.prof_delta d
  LEFT JOIN prof p ON p.code = d.code
WHERE p.id IS NULL
`

func InsertAllProfs(conn *db.Conn, profs []Prof) (*log.DbResult, error) {
	var result log.DbResult

	tx, err := conn.Begin()
	if err != nil {
		return &result, fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(TruncateProfQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to truncate work table: %w", err)
	}

	var preparedProfs [][]interface{}
	// Filter duplicates before going to database: this is faster
	seenProfCode := make(map[string]bool)
	for _, prof := range profs {
		if !seenProfCode[prof.Code] {
			preparedProfs = append(preparedProfs, util.AsSlice(prof))
			seenProfCode[prof.Code] = true
		}
	}

	_, err = tx.CopyFrom(
		db.Identifier{"work", "prof_delta"},
		util.Fields(profs),
		preparedProfs,
	)
	if err != nil {
		return &result, fmt.Errorf("failed to copy data: %w", err)
	}

	tag, err := tx.Exec(InsertProfQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to insert: %w", err)
	}
	result.Inserted = int(tag.RowsAffected())

	err = tx.Commit()
	if err != nil {
		return &result, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// In this case, we do deliberately refuse to update existing profs
	// so the remainder after deduplication is untouched.
	result.Untouched = len(preparedProfs) - result.Inserted
	return &result, nil
}
