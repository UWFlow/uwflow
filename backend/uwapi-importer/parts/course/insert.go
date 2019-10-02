package course

import (
	"fmt"
	"strings"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/db"
)

const SetupCourseQuery = `
DROP TABLE IF EXISTS _course_delta;

CREATE TEMPORARY TABLE _course_delta(
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  prereqs TEXT,
  coreqs TEXT,
  antireqs TEXT
);
`

const UpdateCourseQuery = `
UPDATE course SET
  name = delta.name,
  description = delta.description,
  prereqs = delta.prereqs,
  coreqs = delta.coreqs,
  antireqs = delta.antireqs
FROM _course_delta delta
WHERE course.code = delta.code
`

const InsertCourseQuery = `
INSERT INTO course(code, name, description, prereqs, coreqs, antireqs)
SELECT
  d.code, d.name, d.description, d.prereqs, d.coreqs, d.antireqs
FROM _course_delta d
  LEFT JOIN course c ON c.code = d.code
WHERE c.id IS NULL
`

const TeardownCourseQuery = `DROP TABLE _course_delta`

func InsertAll(conn *db.Conn, courses []Course) (*db.Result, error) {
	var result db.Result

	tx, err := conn.Begin()
	if err != nil {
		return &result, fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(SetupCourseQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to create temporary table: %w", err)
	}

	var preparedCourses [][]interface{}
	for _, course := range courses {
		courseCode := strings.ToLower(course.Subject + course.Number)
		if courseCode == "" {
			result.Rejected++
			continue
		}
		preparedCourses = append(
			preparedCourses,
			[]interface{}{
				courseCode, course.Name, course.Description,
				course.Prereqs, course.Coreqs, course.Antireqs,
			},
		)
	}

	_, err = tx.CopyFrom(
		"_course_delta",
		[]string{"code", "name", "description", "prereqs", "coreqs", "antireqs"},
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

	_, err = tx.Exec(TeardownCourseQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to tear down table: %w", err)
	}

	err = tx.Commit()
	if err != nil {
		return &result, fmt.Errorf("failed to commit transaction: %w", err)
	}

  touched := result.Inserted + result.Updated + result.Rejected
	result.Untouched = len(courses) - touched
	return &result, nil
}
