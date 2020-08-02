package course

import (
	"fmt"

	"flow/common/db"
	"flow/common/util"
	"flow/importer/uw/log"
)

const TruncateCourseQuery = `TRUNCATE work.course_delta`

const UpdateCourseQuery = `
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

const InsertCourseQuery = `
INSERT INTO course(code, name, description, prereqs, coreqs, antireqs)
SELECT
  d.code, d.name, d.description, d.prereqs, d.coreqs, d.antireqs
FROM work.course_delta d
  LEFT JOIN course c ON c.code = d.code
WHERE c.id IS NULL
`

func InsertAllCourses(conn *db.Conn, courses []Course) (*log.DbResult, error) {
	var result log.DbResult

	tx, err := conn.Begin()
	if err != nil {
		return nil, fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(TruncateCourseQuery)
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

	tag, err := tx.Exec(UpdateCourseQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to apply update: %w", err)
	}
	result.Updated = int(tag.RowsAffected())

	tag, err = tx.Exec(InsertCourseQuery)
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

const TruncatePrereqQuery = `
TRUNCATE work.course_prerequisite_delta;
`

const ClearPrereqQuery = `
DELETE FROM course_prerequisite
WHERE course_id IN (SELECT course_id FROM work.course_prerequisite_delta)
`

const InsertPrereqQuery = `
INSERT INTO course_prerequisite(course_id, prerequisite_id, is_corequisite)
SELECT
  c.id, p.id, d.is_coreq
FROM work.course_prerequisite_delta d
  JOIN course c ON c.code = d.course_code
  JOIN course p ON p.code = d.prereq_code
ON CONFLICT (course_id, prerequisite_id) DO NOTHING
`

func InsertAllPrereqs(conn *db.Conn, prereqs []Prereq) error {
	var result log.DbResult

	tx, err := conn.Begin()
	if err != nil {
		return fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(TruncatePrereqQuery)
	if err != nil {
		return fmt.Errorf("failed to truncate work table: %w", err)
	}

	_, err = tx.Exec(ClearPrereqQuery)
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

	tag, err := tx.Exec(InsertPrereqQuery)
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
const TruncateAntireqQuery = `
TRUNCATE course_antirequisite;
TRUNCATE work.course_antirequisite_delta;
`

const ClearAntireqQuery = `
DELETE FROM course_antirequisite
WHERE course_id IN (SELECT course_id FROM work.course_antirequisite_delta)
`

const InsertAntireqQuery = `
INSERT INTO course_antirequisite(course_id, antirequisite_id)
SELECT
  c.id, a.id
FROM work.course_antirequisite_delta d
  JOIN course c ON c.code = d.course_code
  JOIN course a ON a.code = d.antireq_code
ON CONFLICT (course_id, antirequisite_id) DO NOTHING
`

func InsertAllAntireqs(conn *db.Conn, antireqs []Antireq) error {
	var result log.DbResult

	tx, err := conn.Begin()
	if err != nil {
		return fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(TruncateAntireqQuery)
	if err != nil {
		return fmt.Errorf("failed to truncate work table: %w", err)
	}

	_, err = tx.Exec(ClearAntireqQuery)
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

	tag, err := tx.Exec(InsertAntireqQuery)
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
