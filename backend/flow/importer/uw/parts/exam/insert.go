package exam

import (
	"fmt"

	"flow/common/db"
	"flow/common/util"
	"flow/importer/uw/log"
)

const TruncateExamQuery = `TRUNCATE work.section_exam_delta`

const UpdateExamQuery = `
UPDATE section_exam SET
  section_id = s.id,
  location = delta.location,
  start_seconds = delta.start_seconds,
  end_seconds = delta.end_seconds,
  date = delta.date,
  day = delta.day,
  is_tba = delta.is_tba
FROM work.section_exam_delta delta
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
FROM work.section_exam_delta d
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

func InsertAll(conn *db.Conn, exams []Exam) (*log.DbResult, error) {
	var result log.DbResult

	tx, err := conn.Begin()
	if err != nil {
		return &result, fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(TruncateExamQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to truncate work table: %w", err)
	}

	preparedExams := make([][]interface{}, len(exams))
	for i, exam := range exams {
		preparedExams[i] = util.AsSlice(exam)
	}

	_, err = tx.CopyFrom(
		db.Identifier{"work", "section_exam_delta"},
		util.Fields(exams),
		preparedExams,
	)
	if err != nil {
		return &result, fmt.Errorf("failed to copy data: %w", err)
	}

	tag, err := tx.Exec(UpdateExamQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to apply update: %w", err)
	}
	result.Updated = int(tag.RowsAffected())

	tag, err = tx.Exec(InsertExamQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to insert: %w", err)
	}
	result.Inserted = int(tag.RowsAffected())

	err = tx.Commit()
	if err != nil {
		return &result, fmt.Errorf("failed to commit transaction: %w", err)
	}

	result.Rejected = len(exams) - result.Inserted - result.Updated
	return &result, nil
}
