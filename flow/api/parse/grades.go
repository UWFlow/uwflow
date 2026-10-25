package parse

import (
	"fmt"
	"strconv"

	"flow/api/parse/transcript"
	"flow/common/db"
)

type courseGrade struct {
	code   string
	termId int
	grade  string
	// mark is nil for grades that are codes, like CR.
	mark *int
}

type termGPA struct {
	termId int
	level  string
	// termGPA and cumulativeGPA are nil until a course with a mark is done.
	termGPA       *string
	cumulativeGPA *string
}

// gradeRows flattens a transcript into rows for user_course_grade and
// user_term_gpa. Courses still in progress have no grade and are skipped.
//
// A transcript prints 0.00 for the GPA of a term with no marks, such as a
// co-op term, and for the cumulative GPA before any marks. Those are not
// real averages, so they become nil.
func gradeRows(summary *transcript.Summary) ([]courseGrade, []termGPA) {
	var grades []courseGrade
	var gpas []termGPA
	hasMarks := false
	for _, term := range summary.TermSummaries {
		termHasMarks := false
		for i, code := range term.Courses {
			grade := term.Grades[i]
			if grade == "" {
				continue
			}
			row := courseGrade{code: code, termId: term.TermId, grade: grade}
			if mark, err := strconv.Atoi(grade); err == nil && mark >= 0 && mark <= 100 {
				row.mark = &mark
				termHasMarks = true
			}
			grades = append(grades, row)
		}
		hasMarks = hasMarks || termHasMarks

		gpa := termGPA{termId: term.TermId, level: term.Level}
		if termHasMarks && term.TermGPA != "" {
			gpa.termGPA = &term.TermGPA
		}
		if hasMarks && term.CumulativeGPA != "" {
			gpa.cumulativeGPA = &term.CumulativeGPA
		}
		gpas = append(gpas, gpa)
	}
	return grades, gpas
}

const deleteCourseGradesQuery = `
DELETE FROM user_course_grade WHERE user_id = $1
`

const deleteTermGPAsQuery = `
DELETE FROM user_term_gpa WHERE user_id = $1
`

const deleteTranscriptDocumentQuery = `
DELETE FROM user_document WHERE user_id = $1 AND kind = 'transcript'
`

// deleteGrades removes everything saved by saveGrades for this user.
func deleteGrades(tx *db.Tx, userId int) error {
	for _, query := range []string{deleteCourseGradesQuery, deleteTermGPAsQuery, deleteTranscriptDocumentQuery} {
		if _, err := tx.Exec(query, userId); err != nil {
			return fmt.Errorf("deleting saved grades: %w", err)
		}
	}
	return nil
}

// Courses missing from our catalog are skipped, as in user_course_taken.
const insertCourseGradeQuery = `
INSERT INTO user_course_grade(user_id, course_id, term_id, grade, mark)
SELECT $1, id, $3, $4, $5 FROM course WHERE code = $2
`

const insertTermGPAQuery = `
INSERT INTO user_term_gpa(user_id, term_id, level, term_gpa, cumulative_gpa)
VALUES ($1, $2, $3, $4, $5)
`

const insertTranscriptDocumentQuery = `
INSERT INTO user_document(user_id, kind, pdf) VALUES ($1, 'transcript', $2)
`

// saveGrades replaces this user's saved grades with those on the transcript.
// A transcript lists every term, so nothing from an older upload is kept.
// redactedPDF may be nil, in which case no copy of the transcript is kept.
func saveGrades(tx *db.Tx, summary *transcript.Summary, redactedPDF []byte, userId int) error {
	if err := deleteGrades(tx, userId); err != nil {
		return err
	}

	grades, gpas := gradeRows(summary)
	for _, g := range grades {
		if _, err := tx.Exec(insertCourseGradeQuery, userId, g.code, g.termId, g.grade, g.mark); err != nil {
			return fmt.Errorf("writing user_course_grade: %w", err)
		}
	}
	for _, g := range gpas {
		if _, err := tx.Exec(insertTermGPAQuery, userId, g.termId, g.level, g.termGPA, g.cumulativeGPA); err != nil {
			return fmt.Errorf("writing user_term_gpa: %w", err)
		}
	}
	if redactedPDF != nil {
		if _, err := tx.Exec(insertTranscriptDocumentQuery, userId, redactedPDF); err != nil {
			return fmt.Errorf("writing user_document: %w", err)
		}
	}
	return nil
}
