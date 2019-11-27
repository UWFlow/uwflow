package course

import (
	"fmt"
	"strings"

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

func InsertAll(conn *db.Conn, courses []Course) (*log.DbResult, error) {
	var result log.DbResult

	tx, err := conn.Begin()
	if err != nil {
		return &result, fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(TruncateCourseQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to truncate work table: %w", err)
	}

	var preparedCourses [][]interface{}
	for _, course := range courses {
		courseCode := strings.ToLower(course.Subject + course.Number)
		if courseCode == "" {
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
		return &result, fmt.Errorf("failed to copy data: %w", err)
	}

	tag, err := tx.Exec(UpdateCourseQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to apply update: %w", err)
	}
	result.Updated = int(tag.RowsAffected())

	tag, err = tx.Exec(InsertCourseQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to insert: %w", err)
	}
	result.Inserted = int(tag.RowsAffected())

	err = tx.Commit()
	if err != nil {
		return &result, fmt.Errorf("failed to commit transaction: %w", err)
	}

	touched := result.Inserted + result.Updated + result.Rejected
	result.Untouched = len(courses) - touched
	return &result, nil
}
