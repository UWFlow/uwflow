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
`

const InsertCourseQuery = `
INSERT INTO course(code, name, description, prereqs, coreqs, antireqs)
SELECT
  d.code, d.name, d.description, d.prereqs, d.coreqs, d.antireqs
FROM work.course_delta d
  LEFT JOIN course c ON c.code = d.code
WHERE c.id IS NULL
`

func InsertAllCourses(conn *db.Conn, courses []Course) error {
	var result log.DbResult

	tx, err := conn.Begin()
	if err != nil {
		return fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(TruncateCourseQuery)
	if err != nil {
		return fmt.Errorf("failed to truncate work table: %w", err)
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
		return fmt.Errorf("failed to copy data: %w", err)
	}

	tag, err := tx.Exec(UpdateCourseQuery)
	if err != nil {
		return fmt.Errorf("failed to apply update: %w", err)
	}
	result.Updated = int(tag.RowsAffected())

	tag, err = tx.Exec(InsertCourseQuery)
	if err != nil {
		return fmt.Errorf("failed to insert: %w", err)
	}
	result.Inserted = int(tag.RowsAffected())

	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	touched := result.Inserted + result.Updated + result.Rejected
	result.Untouched = len(courses) - touched
	return nil
}

const TruncatePrereqQuery = `TRUNCATE work.prerequisite_delta`

const UpdatePrereqQuery = `
UPDATE course_prerequisite SET
  is_corequisite = delta.is_corequisite
FROM work.prerequisite_delta delta
  JOIN course c ON c.code = delta.course_code
  JOIN course p ON p.code = delta.prereq_code
WHERE course_prerequisite.course_id = c.id
  AND course_prerequisite.prerequisite_id = p.id
`

const InsertPrereqQuery = `
INSERT INTO course_prerequisite(course_id, prerequisite_id, is_corequisite)
SELECT
  c.id, p.id, d.is_coreq
FROM work.prerequisite_delta d
  JOIN course c ON c.code = d.course_code
  JOIN course p ON p.code = d.prereq_code
  LEFT JOIN course_prerequisite old
    ON c.id = old.course_id
   AND p.id = old.prerequisite_id
WHERE c.id IS NULL
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

	var preparedPrereqs [][]interface{}
	for _, prereq := range prereqs {
		preparedPrereqs = append(preparedPrereqs, util.AsSlice(prereq))
	}

	_, err = tx.CopyFrom(
		db.Identifier{"work", "prereq_elta"},
		util.Fields(prereqs),
		preparedPrereqs,
	)
	if err != nil {
		return fmt.Errorf("failed to copy data: %w", err)
	}

	tag, err := tx.Exec(UpdatePrereqQuery)
	if err != nil {
		return fmt.Errorf("failed to apply update: %w", err)
	}
	result.Updated = int(tag.RowsAffected())

	tag, err = tx.Exec(InsertPrereqQuery)
	if err != nil {
		return fmt.Errorf("failed to insert: %w", err)
	}
	result.Inserted = int(tag.RowsAffected())

	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	touched := result.Inserted + result.Updated
	result.Untouched = len(prereqs) - touched
	return nil
}
