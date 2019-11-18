package exam

import (
	"context"
	"fmt"

	"flow/common/db"
	"flow/worker/importer/uw/log"

	"github.com/jackc/pgx/v4"
)

const SetupExamQuery = `
DROP TABLE IF EXISTS _section_exam_delta;

CREATE TEMPORARY TABLE _section_exam_delta(
  course_code TEXT NOT NULL,
  section_name TEXT NOT NULL,
  term INT NOT NULL,
  location TEXT,
  start_seconds INT,
  end_seconds INT,
  date DATE,
  day TEXT,
  is_tba BOOLEAN NOT NULL
);
`

const UpdateExamQuery = `
UPDATE section_exam SET
  section_id = s.id,
  location = delta.location,
  start_seconds = delta.start_seconds,
  end_seconds = delta.end_seconds,
  date = delta.date,
  day = delta.day,
  is_tba = delta.is_tba
FROM _section_exam_delta delta
  JOIN course c
    ON c.code = delta.course_code
  JOIN course_section s
    ON s.course_id = c.id
   AND s.section = delta.section_name
   AND s.term = delta.term
WHERE section_exam.section_id = s.id
`

const InsertExamQuery = `
INSERT INTO section_exam(
  section_id, location, start_seconds, end_seconds,
  date, day, is_tba
)
SELECT
  s.id, d.location, d.start_seconds, d.end_seconds,
  d.date, d.day, d.is_tba
FROM _section_exam_delta d
  JOIN course c
    ON c.code = d.course_code
  JOIN course_section s
    ON s.course_id = c.id
   AND s.section = d.section_name
   AND s.term = d.term
  LEFT JOIN section_exam se
    ON se.section_id = s.id
WHERE se.section_id IS NULL
`

const TeardownExamQuery = `DROP TABLE _section_exam_delta`

func InsertAll(ctx context.Context, conn db.Conn, exams []Exam) (*log.DbResult, error) {
	var result log.DbResult

	tx, err := conn.Begin(ctx)
	if err != nil {
		return &result, fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, SetupExamQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to create temporary table: %w", err)
	}

	preparedExams := make([][]interface{}, len(exams))
	for i, exam := range exams {
		preparedExams[i] = []interface{}{
			exam.CourseCode, exam.SectionName, exam.Term, exam.Location,
			exam.StartSeconds, exam.EndSeconds, exam.Date, exam.Day, exam.IsTba,
		}
	}

	_, err = tx.CopyFrom(
		ctx,
		pgx.Identifier{"_section_exam_delta"},
		[]string{
			"course_code", "section_name", "term", "location",
			"start_seconds", "end_seconds", "date", "day", "is_tba",
		},
		pgx.CopyFromRows(preparedExams),
	)
	if err != nil {
		return &result, fmt.Errorf("failed to copy data: %w", err)
	}

	tag, err := tx.Exec(ctx, UpdateExamQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to apply update: %w", err)
	}
	result.Updated = int(tag.RowsAffected())

	tag, err = tx.Exec(ctx, InsertExamQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to insert: %w", err)
	}
	result.Inserted = int(tag.RowsAffected())

	_, err = tx.Exec(ctx, TeardownExamQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to tear down table: %w", err)
	}

	err = tx.Commit(ctx)
	if err != nil {
		return &result, fmt.Errorf("failed to commit transaction: %w", err)
	}

	result.Rejected = len(exams) - result.Inserted - result.Updated
	return &result, nil
}
