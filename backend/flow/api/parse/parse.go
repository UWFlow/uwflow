package parse

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"flow/api/parse/pdf"
	"flow/api/parse/schedule"
	"flow/api/parse/transcript"
	"flow/api/serde"
	"flow/common/db"
	"flow/common/util"
)

type scheduleRequest struct {
	Text string `json:"text"`
}

type scheduleResponse struct {
	SectionsImported int `json:"sections_imported"`
}

type transcriptResponse struct {
	CoursesImported int `json:"courses_imported"`
}

const updateProgramQuery = `
UPDATE "user" SET program = $1 WHERE id = $2
`

const deleteTranscriptQuery = `
DELETE FROM user_course_taken
WHERE term_id <= $1 AND user_id = $2
`

const insertTranscriptQuery = `
INSERT INTO user_course_taken(course_id, user_id, term_id, level)
SELECT id, $2, $3, $4 FROM course WHERE code = $1
`

func HandleTranscript(tx *db.Tx, r *http.Request) (interface{}, error) {
	userId, err := serde.UserIdFromRequest(r)
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, fmt.Errorf("extracting user id: %w", err))
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("expected form/multipart: {file}"))
	}

	var fileContents bytes.Buffer
	fileContents.Grow(int(header.Size))
	fileContents.ReadFrom(file)
	text, err := pdf.ToText(fileContents.Bytes())
	if err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("converting transcript: %w", err))
	}

	result, err := transcript.Parse(text)
	if err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, err)
	}

	_, err = tx.Exec(updateProgramQuery, result.ProgramName, userId)
	if err != nil {
		return nil, fmt.Errorf("updating user program: %w", err)
	}

	var maxTermId int
	for _, summary := range result.CourseHistory {
		if summary.Term > maxTermId {
			maxTermId = summary.Term
		}
	}

	_, err = tx.Exec(deleteTranscriptQuery, maxTermId, userId)
	if err != nil {
		return nil, fmt.Errorf("deleting old courses: %w", err)
	}

	var response transcriptResponse
	for _, summary := range result.CourseHistory {
		response.CoursesImported += len(summary.Courses)
		for _, course := range summary.Courses {
			_, err = tx.Exec(insertTranscriptQuery, course, userId, summary.Term, summary.Level)
			if err != nil {
				return nil, fmt.Errorf("updating user_course_taken: %w", err)
			}
		}
	}

	log.Printf("Imported transcript for user %d: %+v", userId, result)
	return &response, nil
}

func HandleSchedule(tx *db.Tx, r *http.Request) (interface{}, error) {
	userId, err := serde.UserIdFromRequest(r)
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, fmt.Errorf("extracting user id: %w", err))
	}

	var req scheduleRequest
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("malformed JSON: %w", err))
	}

	scheduleSummary, err := schedule.Parse(req.Text)
	if err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, err)
	}
	if scheduleSummary.Term < util.CurrentTermId() {
		return nil, serde.WithStatus(
			http.StatusBadRequest,
			serde.WithEnum(serde.OldSchedule, fmt.Errorf("term %d has passed", scheduleSummary.Term)),
		)
	}

	_, err = tx.Exec(`DELETE FROM user_course_taken WHERE term_id = $1`, scheduleSummary.Term)
	if err != nil {
		return nil, fmt.Errorf("deleting old user_course_taken: %w", err)
	}
	for _, classNumber := range scheduleSummary.ClassNumbers {
		tag, err := tx.Exec(
			`INSERT INTO user_schedule(user_id, section_id) `+
				`SELECT $1, id FROM course_section `+
				`WHERE class_number = $2 AND term_id = $3`,
			userId, classNumber, scheduleSummary.Term,
		)
		if err != nil {
			return nil, fmt.Errorf("writing user_schedule: %w", err)
		}
		if tag.RowsAffected() == 0 {
			return nil, serde.WithStatus(
				http.StatusBadRequest,
				fmt.Errorf("class number %d not found in term %d", classNumber, scheduleSummary.Term),
			)
		}

		_, err = tx.Exec(
			`INSERT INTO user_course_taken(user_id, term_id, course_id) `+
				`SELECT $1, $2, course_id FROM course_section `+
				`WHERE term_id = $2 AND class_number = $3`+
				`ON CONFLICT DO NOTHING`,
			userId, scheduleSummary.Term, classNumber,
		)
		if err != nil {
			return nil, fmt.Errorf("writing user_course_taken: %w", err)
		}
	}

	response := scheduleResponse{SectionsImported: len(scheduleSummary.ClassNumbers)}
	log.Printf("Imported schedule for user %d: %v", userId, scheduleSummary)
	return &response, nil
}
