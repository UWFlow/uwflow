package parse

import (
	"bytes"
	"log"
	"net/http"

	"github.com/AyushK1/uwflow2.0/backend/api/db"
	"github.com/AyushK1/uwflow2.0/backend/api/parse/transcript"
	"github.com/AyushK1/uwflow2.0/backend/api/serde"
)

func HandleTranscript(w http.ResponseWriter, r *http.Request) {
	userId, err := serde.UserIdFromRequest(r)
	if err != nil {
		serde.Error(w, err.Error(), http.StatusUnauthorized)
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
		serde.Error(w, "failed to convert transcript: "+err.Error(), http.StatusBadRequest)
		return
	}

	result, err := transcript.Parse(text)
	if err != nil {
		serde.Error(w, "failed to parse transcript: "+err.Error(), http.StatusBadRequest)
		return
	}

	tx := db.Handle.MustBegin()
	tx.MustExec(
		`UPDATE "user" SET program = $1 WHERE id = $2`,
		result.ProgramName, userId,
	)
	for _, summary := range result.CourseHistory {
		for _, course := range summary.Courses {
			// If (course, user, term) combination exists, do not add it again
			tx.MustExec(
				`INSERT INTO user_course_taken(course_id, user_id, term, level)`+
					`SELECT id, $2, $3, $4 FROM course WHERE code = $1`+
					`ON CONFLICT DO NOTHING`,
				course, userId, summary.Term, summary.Level,
			)
		}
	}
	err = tx.Commit()
	if err != nil {
		serde.Error(w, "failed to write to database: "+err.Error(), http.StatusBadRequest)
	} else {
		w.WriteHeader(http.StatusOK)
	}
	log.Printf("Imported transcript for user %d: %v\n", userId, result)
}
