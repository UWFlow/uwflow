package parse

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"flow/api/parse/schedule"
	"flow/api/parse/transcript"
	"flow/api/serde"
	"flow/common/state"
	"flow/common/util"
)

type ScheduleParseRequest struct {
	Text string `json:"text"`
}

type ScheduleParseResponse struct {
	SectionsImported int `json:"sections_imported"`
}

type TranscriptParseResponse struct {
	CoursesImported int `json:"courses_imported"`
}

func handleTranscript(state *state.State, r *http.Request) (*TranscriptParseResponse, error, int) {
	userId, err := serde.UserIdFromRequest(state, r)
	if err != nil {
		return nil, fmt.Errorf("extracting user id: %v", err), http.StatusUnauthorized
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		return nil, fmt.Errorf("expected form/multipart: {file}"), http.StatusBadRequest
	}

	fileContents := new(bytes.Buffer)
	fileContents.Grow(int(header.Size))
	fileContents.ReadFrom(file)
	text, err := PdfToText(fileContents.Bytes())
	if err != nil {
		return nil, fmt.Errorf("converting transcript: %v", err), http.StatusBadRequest
	}

	result, err := transcript.Parse(text)
	if err != nil {
		return nil, err, http.StatusBadRequest
	}

	tx, err := state.Db.Begin()
	if err != nil {
		return nil, fmt.Errorf("opening transaction: %v", err), http.StatusInternalServerError
	}
	defer tx.Rollback()

	_, err = tx.Exec(
		`UPDATE "user" SET program = $1 WHERE id = $2`,
		result.ProgramName, userId,
	)
	if err != nil {
		return nil, fmt.Errorf("updating user record: %v", err), http.StatusInternalServerError
	}

	var response TranscriptParseResponse
	for _, summary := range result.CourseHistory {
		response.CoursesImported += len(summary.Courses)
		for _, course := range summary.Courses {
			// If (course, user, term) combination exists, do not add it again
			_, err = tx.Exec(
				`INSERT INTO user_course_taken(course_id, user_id, term_id, level) `+
					`SELECT id, $2, $3, $4 FROM course WHERE code = $1 `+
					`ON CONFLICT DO NOTHING`,
				course, userId, summary.Term, summary.Level,
			)
			if err != nil {
				return nil, fmt.Errorf("updating user record: %v", err), http.StatusInternalServerError
			}
		}
	}

	err = tx.Commit()
	if err != nil {
		return nil, fmt.Errorf("committing transaction: %v", err), http.StatusInternalServerError
	} else {
		log.Printf("Imported transcript for user %d: %v\n", userId, result)
		return &response, nil, http.StatusOK
	}
}

func HandleTranscript(state *state.State, w http.ResponseWriter, r *http.Request) {
	response, err, status := handleTranscript(state, r)
	if err != nil {
		serde.Error(w, serde.WithEnum("transcript", err), status)
	}
	json.NewEncoder(w).Encode(response)

}

func handleSchedule(state *state.State, r *http.Request) (*ScheduleParseResponse, error, int) {
	userId, err := serde.UserIdFromRequest(state, r)
	if err != nil {
		return nil, fmt.Errorf("extracting user id: %v", err), http.StatusUnauthorized
	}

	req := ScheduleParseRequest{}
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		return nil, fmt.Errorf("malformed JSON: %v", err), http.StatusBadRequest
	}

	scheduleSummary, err := schedule.Parse(req.Text)
	if err != nil {
		return nil, err, http.StatusBadRequest
	}
	if scheduleSummary.Term < util.CurrentTermId() {
		return nil, fmt.Errorf("cannot import schedule for past term %d", scheduleSummary.Term), http.StatusBadRequest
	}

	tx, err := state.Db.Begin()
	if err != nil {
		return nil, fmt.Errorf("opening transaction: %v", err), http.StatusInternalServerError
	}
	defer tx.Rollback()

	_, err = tx.Exec(
		`DELETE FROM user_course_taken WHERE term_id = $1`, scheduleSummary.Term,
	)
	if err != nil {
		return nil, fmt.Errorf("clearing sections: %v", err), http.StatusInternalServerError
	}
	for _, classNumber := range scheduleSummary.ClassNumbers {
		tag, err := tx.Exec(
			`INSERT INTO user_schedule(user_id, section_id) `+
				`SELECT $1, id FROM course_section `+
				`WHERE class_number = $2 AND term_id = $3`,
			userId, classNumber, scheduleSummary.Term,
		)
		if err != nil {
			return nil, fmt.Errorf("storing sections: %v", err), http.StatusInternalServerError
		}
		if tag.RowsAffected() == 0 {
			return nil, fmt.Errorf("class number %d not found in term %d", classNumber, scheduleSummary.Term), http.StatusBadRequest
		}
		tx.Exec(
			`INSERT INTO user_course_taken(user_id, term_id, course_id) `+
				`SELECT $1, $2, course_id FROM course_section `+
				`WHERE term_id = $2 AND class_number = $3`+
				`ON CONFLICT DO NOTHING`,
			userId, scheduleSummary.Term, classNumber,
		)
	}

	err = tx.Commit()
	if err != nil {
		return nil, fmt.Errorf("committing: %v", err), http.StatusInternalServerError
	} else {
		response := &ScheduleParseResponse{
			SectionsImported: len(scheduleSummary.ClassNumbers),
		}
		log.Printf("Imported schedule for user %d: %v\n", userId, scheduleSummary)
		return response, nil, http.StatusOK
	}
}

func HandleSchedule(state *state.State, w http.ResponseWriter, r *http.Request) {
	response, err, status := handleSchedule(state, r)
	if err != nil {
		serde.Error(w, serde.WithEnum("schedule", err), status)
	}
	json.NewEncoder(w).Encode(response)

}
