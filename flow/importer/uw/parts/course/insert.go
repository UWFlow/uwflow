package course

import (
	"fmt"

	"flow/common/db"
	"flow/common/util"
	"flow/importer/uw/log"
)

const truncateCourseQuery = `TRUNCATE work.course_delta`

const updateCourseQuery = `
UPDATE course SET
  name = delta.name,
  description = delta.description,
  prereqs = delta.prereqs,
  coreqs = delta.coreqs,
  antireqs = delta.antireqs
FROM work.course_delta delta
WHERE course.code = delta.code
AND NOT course.authoritative
`

const insertCourseQuery = `
INSERT INTO course(code, name, description, prereqs, coreqs, antireqs)
SELECT
  d.code, d.name, d.description, d.prereqs, d.coreqs, d.antireqs
FROM work.course_delta d
  LEFT JOIN course c ON c.code = d.code
WHERE c.id IS NULL
`

func insertAllCourses(conn *db.Conn, courses []course) (*log.DbResult, error) {
	var result log.DbResult

	tx, err := conn.Begin()
	if err != nil {
		return nil, fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(truncateCourseQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to truncate work table: %w", err)
	}

	var preparedCourses [][]interface{}
	for _, course := range courses {
		if course.Code == "" {
			result.Rejected++
			continue
		}
		preparedCourses = append(preparedCourses, util.AsSlice(course))
	}

	_, err = tx.CopyFrom(
		db.Identifier{"work", "course_delta"},
		util.Fields(courses),
		preparedCourses,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to copy data: %w", err)
	}

	tag, err := tx.Exec(updateCourseQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to apply update: %w", err)
	}
	result.Updated = int(tag.RowsAffected())

	tag, err = tx.Exec(insertCourseQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to insert: %w", err)
	}
	result.Inserted = int(tag.RowsAffected())

	err = tx.Commit()
	if err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	touched := result.Inserted + result.Updated + result.Rejected
	result.Untouched = len(courses) - touched
	return &result, nil
}

const truncatePrereqQuery = `
TRUNCATE work.course_prerequisite_delta;
`

const clearPrereqQuery = `
DELETE FROM course_prerequisite
WHERE course_id IN (SELECT course_id FROM work.course_prerequisite_delta)
`

const insertPrereqQuery = `
INSERT INTO course_prerequisite(course_id, prerequisite_id, is_corequisite)
SELECT
  c.id, p.id, d.is_coreq
FROM work.course_prerequisite_delta d
  JOIN course c ON c.code = d.course_code
  JOIN course p ON p.code = d.prereq_code
ON CONFLICT (course_id, prerequisite_id) DO NOTHING
`

func insertAllPrereqs(conn *db.Conn, prereqs []prereq) error {
	var result log.DbResult

	tx, err := conn.Begin()
	if err != nil {
		return fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(truncatePrereqQuery)
	if err != nil {
		return fmt.Errorf("failed to truncate work table: %w", err)
	}

	_, err = tx.Exec(clearPrereqQuery)
	if err != nil {
		return fmt.Errorf("failed to clean up target table: %w", err)
	}

	var preparedPrereqs [][]interface{}
	for _, prereq := range prereqs {
		preparedPrereqs = append(preparedPrereqs, util.AsSlice(prereq))
	}

	_, err = tx.CopyFrom(
		db.Identifier{"work", "course_prerequisite_delta"},
		util.Fields(prereqs),
		preparedPrereqs,
	)
	if err != nil {
		return fmt.Errorf("failed to copy data: %w", err)
	}

	tag, err := tx.Exec(insertPrereqQuery)
	if err != nil {
		return fmt.Errorf("failed to insert: %w", err)
	}
	result.Inserted = int(tag.RowsAffected())

	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// We fetch courses rarely enough that it's easier to truncate
// requisite tables every time instead of fumbling with updates/deletions.
const truncateAntireqQuery = `
TRUNCATE course_antirequisite;
TRUNCATE work.course_antirequisite_delta;
`

const clearAntireqQuery = `
DELETE FROM course_antirequisite
WHERE course_id IN (SELECT course_id FROM work.course_antirequisite_delta)
`

const insertAntireqQuery = `
INSERT INTO course_antirequisite(course_id, antirequisite_id)
SELECT
  c.id, a.id
FROM work.course_antirequisite_delta d
  JOIN course c ON c.code = d.course_code
  JOIN course a ON a.code = d.antireq_code
ON CONFLICT (course_id, antirequisite_id) DO NOTHING
`

func insertAllAntireqs(conn *db.Conn, antireqs []antireq) error {
	var result log.DbResult

	tx, err := conn.Begin()
	if err != nil {
		return fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(truncateAntireqQuery)
	if err != nil {
		return fmt.Errorf("failed to truncate work table: %w", err)
	}

	_, err = tx.Exec(clearAntireqQuery)
	if err != nil {
		return fmt.Errorf("failed to cleanup target table: %w", err)
	}

	var preparedAntireqs [][]interface{}
	for _, antireq := range antireqs {
		preparedAntireqs = append(preparedAntireqs, util.AsSlice(antireq))
	}

	_, err = tx.CopyFrom(
		db.Identifier{"work", "course_antirequisite_delta"},
		util.Fields(antireqs),
		preparedAntireqs,
	)
	if err != nil {
		return fmt.Errorf("failed to copy data: %w", err)
	}

	tag, err := tx.Exec(insertAntireqQuery)
	if err != nil {
		return fmt.Errorf("failed to insert: %w", err)
	}
	result.Inserted = int(tag.RowsAffected())

	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

const truncateSectionQuery = `
  TRUNCATE work.course_section_delta
`

const updateSectionQuery = `
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

const insertSectionQuery = `
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

func insertAllSections(conn *db.Conn, sections []section) (*log.DbResult, error) {
	var result log.DbResult

	tx, err := conn.Begin()
	if err != nil {
		return &result, fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(truncateSectionQuery)
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

	tag, err := tx.Exec(updateSectionQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to apply update: %w", err)
	}
	result.Updated = int(tag.RowsAffected())

	tag, err = tx.Exec(insertSectionQuery)
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
const truncateMeetingQuery = `
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

const insertMeetingQuery = `
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

func insertAllMeetings(conn *db.Conn, meetings []meeting) (*log.DbResult, error) {
	var result log.DbResult

	tx, err := conn.Begin()
	if err != nil {
		return &result, fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(truncateMeetingQuery)
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

	tag, err := tx.Exec(insertMeetingQuery)
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

const truncateProfQuery = `TRUNCATE work.prof_delta`

// Profs have nothing to update: name and code are their identifiers
const insertProfQuery = `
INSERT INTO prof(name, code)
SELECT d.name, d.code
FROM work.prof_delta d
  LEFT JOIN prof p ON p.code = d.code
WHERE p.id IS NULL
`

func insertAllProfs(conn *db.Conn, profs profMap) (*log.DbResult, error) {
	var result log.DbResult

	tx, err := conn.Begin()
	if err != nil {
		return &result, fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(truncateProfQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to truncate work table: %w", err)
	}

	var preparedProfs [][]interface{}
	for code, name := range profs {
		preparedProfs = append(preparedProfs, []interface{}{code, name})
	}

	_, err = tx.CopyFrom(
		db.Identifier{"work", "prof_delta"},
		[]string{"code", "name"},
		preparedProfs,
	)
	if err != nil {
		return &result, fmt.Errorf("failed to copy data: %w", err)
	}

	tag, err := tx.Exec(insertProfQuery)
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
