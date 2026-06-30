package admin

import (
	"bytes"
	"crypto/subtle"
	"encoding/json"
	"fmt"
	"io"
	"mime"
	"net/http"
	"strings"

	"flow/api/env"
	"flow/api/serde"
	"flow/common/db"
	"flow/common/util"
)

const (
	adminSecretHeader = "X-Hasura-Admin-Secret"
	maxUploadBytes    = 25 << 20
)

// prof_teaches.json shape: [{ "term_code": 1265, "data": [{ "course_code", "instructor" }] }]
type termUpload struct {
	TermID int `json:"term_code"`
	Data   []struct {
		CourseCode string `json:"course_code"`
		Instructor string `json:"instructor"`
	} `json:"data"`
}

type uploadResult struct {
	RowsReceived     int   `json:"rows_received"`
	RowsDeduped      int   `json:"rows_deduped"`
	ProfsCreated     int64 `json:"profs_created"`
	LinksUpserted    int64 `json:"links_upserted"`
	UnmatchedCourses int   `json:"unmatched_courses"`
}

// Upsert profs by code (the same identity the UW importer uses), then link them
// to courses matched by code. Source defaults via the table; re-running a term
// just bumps updated_at.
const upsertProfsQuery = `
INSERT INTO prof(code, name)
SELECT * FROM unnest($1::text[], $2::text[])
ON CONFLICT (code) DO NOTHING
`

const upsertLinksQuery = `
INSERT INTO scraped_prof_teaches_course(course_id, prof_id, term_id)
SELECT c.id, p.id, t.term_id
FROM unnest($1::text[], $2::text[], $3::int[]) AS t(course_code, prof_code, term_id)
  JOIN course c ON c.code = t.course_code
  JOIN prof p ON p.code = t.prof_code
ON CONFLICT (course_id, prof_id, term_id, source) DO UPDATE SET updated_at = NOW()
`

func HandleCourseProfessorsUpload(tx *db.Tx, r *http.Request) (interface{}, error) {
	if err := requireAdminSecret(r); err != nil {
		return nil, err
	}

	payload, err := readUploadPayload(r)
	if err != nil {
		return nil, err
	}

	parsed, err := parseUpload(payload)
	if err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, err)
	}

	result := uploadResult{
		RowsReceived: parsed.RowsReceived,
		RowsDeduped:  len(parsed.TermIDs),
	}
	if len(parsed.TermIDs) == 0 {
		return &result, nil
	}

	tag, err := tx.Exec(upsertProfsQuery, parsed.ProfCodes, parsed.ProfNames)
	if err != nil {
		return nil, fmt.Errorf("upserting profs: %w", err)
	}
	result.ProfsCreated = tag.RowsAffected()

	tag, err = tx.Exec(upsertLinksQuery, parsed.CourseCodes, parsed.ProfCodes, parsed.TermIDs)
	if err != nil {
		return nil, fmt.Errorf("upserting links: %w", err)
	}
	result.LinksUpserted = tag.RowsAffected()
	// ponytail: each deduped row targets exactly one course, so the gap is rows
	// whose course code we couldn't match.
	result.UnmatchedCourses = len(parsed.TermIDs) - int(result.LinksUpserted)

	return &result, nil
}

type parsedUpload struct {
	RowsReceived int
	CourseCodes  []string
	ProfCodes    []string
	ProfNames    []string
	TermIDs      []int
}

func parseUpload(payload []byte) (*parsedUpload, error) {
	var terms []termUpload
	if err := json.Unmarshal(payload, &terms); err != nil {
		return nil, fmt.Errorf("malformed JSON: %w", err)
	}

	parsed := &parsedUpload{}
	seen := make(map[string]bool)
	for _, term := range terms {
		for _, row := range term.Data {
			parsed.RowsReceived++
			courseCode := normalizeCourseCode(row.CourseCode)
			profName := normalizeInstructor(row.Instructor)
			profCode := util.ProfNameToCode(profName)
			if term.TermID == 0 || courseCode == "" || profCode == "" {
				continue
			}
			key := fmt.Sprintf("%d|%s|%s", term.TermID, courseCode, profCode)
			if seen[key] {
				continue
			}
			seen[key] = true
			parsed.CourseCodes = append(parsed.CourseCodes, courseCode)
			parsed.ProfCodes = append(parsed.ProfCodes, profCode)
			parsed.ProfNames = append(parsed.ProfNames, profName)
			parsed.TermIDs = append(parsed.TermIDs, term.TermID)
		}
	}
	return parsed, nil
}

func requireAdminSecret(r *http.Request) error {
	expected := env.Global.HasuraAdminSecret
	got := r.Header.Get(adminSecretHeader)
	if subtle.ConstantTimeCompare([]byte(got), []byte(expected)) != 1 {
		return serde.WithStatus(http.StatusUnauthorized, fmt.Errorf("missing or invalid %s", adminSecretHeader))
	}
	return nil
}

func readUploadPayload(r *http.Request) ([]byte, error) {
	contentType, _, _ := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if contentType == "multipart/form-data" {
		file, _, err := r.FormFile("file")
		if err != nil {
			return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("expected form/multipart: {file}"))
		}
		defer file.Close()
		return readLimited(file)
	}
	return readLimited(r.Body)
}

func readLimited(r io.Reader) ([]byte, error) {
	var buf bytes.Buffer
	n, err := buf.ReadFrom(io.LimitReader(r, maxUploadBytes+1))
	if err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("reading upload: %w", err))
	}
	if n > maxUploadBytes {
		return nil, serde.WithStatus(http.StatusRequestEntityTooLarge, fmt.Errorf("upload exceeds %d bytes", maxUploadBytes))
	}
	return buf.Bytes(), nil
}

func normalizeCourseCode(courseCode string) string {
	return strings.ToLower(strings.Join(strings.Fields(strings.TrimSpace(courseCode)), ""))
}

func normalizeInstructor(name string) string {
	return strings.Join(strings.Fields(strings.TrimRight(strings.TrimSpace(name), ", ")), " ")
}
