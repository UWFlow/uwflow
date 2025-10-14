package parse

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"flow/api/parse/pdf"
	"flow/api/parse/schedule"
	"flow/api/parse/transcript"
	"flow/api/serde"
	"flow/common/db"
	"flow/common/util"
)

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

func saveTranscript(tx *db.Tx, summary *transcript.Summary, userId int) (*transcriptResponse, error) {
	// Refuse to import empty transcript: we probably failed to parse it correctly
	if len(summary.TermSummaries) == 0 {
		return nil, serde.WithStatus(
			http.StatusBadRequest,
			serde.WithEnum(serde.EmptyTranscript, fmt.Errorf("empty transcript")),
		)
	}

	_, err := tx.Exec(updateProgramQuery, summary.ProgramName, userId)
	if err != nil {
		return nil, fmt.Errorf("updating user program: %w", err)
	}

	var maxTermId int
	for _, termSummary := range summary.TermSummaries {
		if termSummary.TermId > maxTermId {
			maxTermId = termSummary.TermId
		}
	}

	_, err = tx.Exec(deleteTranscriptQuery, maxTermId, userId)
	if err != nil {
		return nil, fmt.Errorf("deleting old courses: %w", err)
	}

	var response transcriptResponse
	for _, termSummary := range summary.TermSummaries {
		response.CoursesImported += len(termSummary.Courses)
		for _, course := range termSummary.Courses {
			_, err = tx.Exec(insertTranscriptQuery, course, userId, termSummary.TermId, termSummary.Level)
			if err != nil {
				return nil, fmt.Errorf("updating user_course_taken: %w", err)
			}
		}
	}

	return &response, nil
}

func HandleTranscript(tx *db.Tx, r *http.Request) (interface{}, error) {
	userId, err := serde.UserIdFromRequest(r)
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, fmt.Errorf("extracting user id: %w", err))
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("expected form/multipart: {file}"))
	}

	const maxFileSize = 10 << 20 // 10 MB
	if header.Size > maxFileSize {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("file too large: max 10MB"))
	}

	var fileContents = bufferPool.Get().(*bytes.Buffer)
	defer bufferPool.Put(fileContents)
	fileContents.Reset()
	fileContents.Grow(int(header.Size))
	fileContents.ReadFrom(file)
	data := fileContents.Bytes()

	// Validate PDF magic bytes
	if len(data) < 4 || string(data[:4]) != "%PDF" {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("invalid file type: expected PDF"))
	}

	text, err := pdf.ToText(data)
	if err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("converting to text: %w", err))
	}

	summary, err := transcript.Parse(text)
	if err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("parsing: %w", err))
	}

	response, err := saveTranscript(tx, summary, userId)
	if err != nil {
		return nil, err
	}

	log.Printf("Imported transcript for user %d", userId)
	return response, nil
}

type scheduleResponse struct {
	SectionsImported int   `json:"sections_imported"`
	FailedClasses    []int `json:"failed_classes"`
}

const deleteCourseTakenQuery = `
DELETE FROM user_course_taken
WHERE user_id = $1 AND term_id = $2
`

const insertCourseTakenQuery = `
INSERT INTO user_course_taken(user_id, term_id, course_id)
SELECT $1, $2, course_id FROM course_section
WHERE term_id = $2 AND class_number = $3
ON CONFLICT DO NOTHING
`

const deleteScheduleQuery = `
DELETE FROM user_schedule
USING course_section cs
WHERE user_id = $1
  AND section_id = cs.id
  AND cs.term_id = $2
`

const insertScheduleQuery = `
INSERT INTO user_schedule(user_id, section_id)
SELECT $1, id FROM course_section
WHERE class_number = $2 AND term_id = $3
`

func saveSchedule(tx *db.Tx, summary *schedule.Summary, userId int) (*scheduleResponse, error) {
	// Refuse to import old schedule: there are no sections in database, so we will fail
	if summary.TermId < util.CurrentTermId() {
		return nil, serde.WithStatus(
			http.StatusBadRequest,
			serde.WithEnum(serde.OldSchedule, fmt.Errorf("term %d has passed", summary.TermId)),
		)
	}

	// Refuse to import empty schedule: we probably failed to parse it
	if len(summary.ClassNumbers) == 0 {
		return nil, serde.WithStatus(
			http.StatusBadRequest,
			serde.WithEnum(serde.EmptySchedule, fmt.Errorf("empty schedule")),
		)
	}

	_, err := tx.Exec(deleteCourseTakenQuery, userId, summary.TermId)
	if err != nil {
		return nil, fmt.Errorf("deleting old user_course_taken: %w", err)
	}

	_, err = tx.Exec(deleteScheduleQuery, userId, summary.TermId)
	if err != nil {
		return nil, fmt.Errorf("deleting old user_schedule: %w", err)
	}

	var failedClasses []int
	for _, classNumber := range summary.ClassNumbers {
		tag, err := tx.Exec(insertScheduleQuery, userId, classNumber, summary.TermId)
		if err != nil {
			return nil, fmt.Errorf("writing user_schedule: %w", err)
		}

		// If we didn't end up writing anything, the join must have been empty,
		// so there was no section with the given number.
		// Most likely UW API did not provide us with all of the available classes,
		// or we misparsed the class.
		if tag.RowsAffected() == 0 {
			failedClasses = append(failedClasses, classNumber)
			log.Printf("Schedule import failed for class number %d", classNumber)
		}

		_, err = tx.Exec(insertCourseTakenQuery, userId, summary.TermId, classNumber)
		if err != nil {
			return nil, fmt.Errorf("writing user_course_taken: %w", err)
		}
	}

	return &scheduleResponse{SectionsImported: len(summary.ClassNumbers), FailedClasses: failedClasses}, nil
}

type scheduleRequest struct {
	Text string `json:"text"`
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

	const maxTextSize = 1 << 20 // 1 MB
	if len(req.Text) > maxTextSize {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("text too large: max 1MB"))
	}

	summary, err := schedule.Parse(req.Text)
	if err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("parsing: %w", err))
	}

	response, err := saveSchedule(tx, summary, userId)
	if err != nil {
		return nil, fmt.Errorf("saving: %w", err)
	}

	log.Printf("Imported schedule for user %d", userId)
	return response, nil
}

var bufferPool = sync.Pool{
	New: func() interface{} { return &bytes.Buffer{} },
}
