package parse

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/AyushK1/uwflow2.0/backend/api/parse/schedule"
	"github.com/AyushK1/uwflow2.0/backend/api/parse/transcript"
	"github.com/AyushK1/uwflow2.0/backend/api/serde"
	"github.com/AyushK1/uwflow2.0/backend/api/state"
	"github.com/AyushK1/uwflow2.0/backend/api/util"
)

type ScheduleParseRequest struct {
	Text string `json:"text"`
}

type ScheduleParseResponse struct {
	SectionsImported int `json:"sections_imported"`
}

func HandleTranscript(state *state.State, w http.ResponseWriter, r *http.Request) {
	userId, err := serde.UserIdFromRequest(state, r)
	if err != nil {
		serde.Error(
			w,
			fmt.Sprintf("failed to extract user id: %v", err),
			http.StatusUnauthorized,
		)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		serde.Error(w, "expected form/multipart: {file}", http.StatusBadRequest)
		return
	}

	fileContents := new(bytes.Buffer)
	fileContents.Grow(int(header.Size))
	fileContents.ReadFrom(file)
	text, err := PdfToText(fileContents.Bytes())
	if err != nil {
		serde.Error(w, fmt.Sprintf("failed to convert transcript: %v", err), http.StatusBadRequest)
		return
	}

	result, err := transcript.Parse(text)
	if err != nil {
		serde.Error(w, fmt.Sprintf("failed to parse transcript: %v", err), http.StatusBadRequest)
		return
	}

	tx, err := state.Conn.Begin()
	if err != nil {
		serde.Error(
			w,
			fmt.Sprintf("failed to open transaction: %v", err),
			http.StatusInternalServerError,
		)
		return
	}
	defer tx.Rollback()

	_, err = tx.Exec(
		`UPDATE "user" SET program = $1 WHERE id = $2`,
		result.ProgramName, userId,
	)
	if err != nil {
		serde.Error(
			w,
			fmt.Sprintf("failed to update user record: %v", err),
			http.StatusInternalServerError,
		)
		return
	}

	for _, summary := range result.CourseHistory {
		for _, course := range summary.Courses {
			// If (course, user, term) combination exists, do not add it again
			_, err = tx.Exec(
				`INSERT INTO user_course_taken(course_id, user_id, term, level) `+
					`SELECT id, $2, $3, $4 FROM course WHERE code = $1 `+
					`ON CONFLICT DO NOTHING`,
				course, userId, summary.Term, summary.Level,
			)
			if err != nil {
				serde.Error(
					w,
					fmt.Sprintf("failed to update user record: %v", err),
					http.StatusInternalServerError,
				)
				return
			}
		}
	}

	err = tx.Commit()
	if err != nil {
		serde.Error(
			w,
			fmt.Sprintf("failed to commit transaction: %v", err),
			http.StatusInternalServerError,
		)
	} else {
		w.WriteHeader(http.StatusOK)
		log.Printf("Imported transcript for user %d: %v\n", userId, result)
	}
}

func HandleSchedule(state *state.State, w http.ResponseWriter, r *http.Request) {
	userId, err := serde.UserIdFromRequest(state, r)
	if err != nil {
		serde.Error(
			w,
			fmt.Sprintf("failed to extract user id: %v", err),
			http.StatusUnauthorized,
		)
		return
	}

	req := ScheduleParseRequest{}
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		serde.Error(w, fmt.Sprintf("malformed JSON: %v", err), http.StatusBadRequest)
		return
	}

	scheduleSummary, err := schedule.Parse(req.Text)
	if err != nil {
		serde.Error(w, fmt.Sprintf("failed to parse schedule: %v", err), http.StatusBadRequest)
		return
	}
	if scheduleSummary.Term < util.CurrentPostgresTerm() {
		serde.Error(
			w,
			fmt.Sprintf("cannot import schedule for past term %d", scheduleSummary.Term),
			http.StatusBadRequest,
		)
		return
	}

	tx, err := state.Conn.Begin()
	if err != nil {
		serde.Error(
			w,
			fmt.Sprintf("failed to open transaction: %v", err),
			http.StatusInternalServerError,
		)
		return
	}
	defer tx.Rollback()

	for _, classNumber := range scheduleSummary.ClassNumbers {
		tag, err := tx.Exec(
			`INSERT INTO user_schedule(user_id, section_id) `+
				`SELECT $1, id FROM course_section `+
				`WHERE class_number = $2 AND term = $3`,
			userId, classNumber, scheduleSummary.Term,
		)
		if err != nil {
			serde.Error(
				w,
				fmt.Sprintf("failed to store section: %v", err),
				http.StatusInternalServerError,
			)
			return
		}
		if tag.RowsAffected() == 0 {
			serde.Error(
				w,
				fmt.Sprintf("class number %d not found in term %d", classNumber, scheduleSummary.Term),
				http.StatusBadRequest,
			)
			return
		}
	}

	err = tx.Commit()
	if err != nil {
		serde.Error(
			w,
			fmt.Sprintf("failed to commit transaction: %v", err),
			http.StatusInternalServerError,
		)
	} else {
		w.WriteHeader(http.StatusOK)
		log.Printf("Imported schedule for user %d: %v\n", userId, scheduleSummary)
	}
}
