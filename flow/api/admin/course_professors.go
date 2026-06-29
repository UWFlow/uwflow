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

	"github.com/jackc/pgx/v5/pgtype"
)

const (
	adminSecretHeader = "X-Hasura-Admin-Secret"
	defaultSource     = "quest_scraper"
	fuzzyThreshold    = 0.6
	maxUploadBytes    = 25 << 20
	sampleLimit       = 50
)

type courseProfessorUploadRow struct {
	TermID     int    `json:"term_code"`
	CourseCode string `json:"course_code"`
	CourseID   int    `json:"course_id"`
	Instructor string `json:"instructor"`
}

type courseProfessorInput struct {
	RowNum     int
	TermID     int
	CourseCode string
	CourseID   int
	Instructor string
}

type uploadRowIssue struct {
	RowNum          int      `json:"row"`
	Reason          string   `json:"reason"`
	TermID          int      `json:"term_code,omitempty"`
	CourseCode      string   `json:"course_code,omitempty"`
	CourseID        int      `json:"course_id,omitempty"`
	Instructor      string   `json:"instructor,omitempty"`
	MatchedProfName string   `json:"matched_prof_name,omitempty"`
	MatchedProfID   int      `json:"matched_prof_id,omitempty"`
	FuzzyScore      *float32 `json:"fuzzy_match_score,omitempty"`
	SameSubject     bool     `json:"same_subject,omitempty"`
	MatchesCourse   bool     `json:"matches_course,omitempty"`
}

type parsedCourseProfessorUpload struct {
	RowsReceived      int
	ValidRows         int
	DuplicatesRemoved int
	Inputs            []courseProfessorInput
	InvalidRows       int
	RejectedSamples   []uploadRowIssue
}

type courseProfessorMatch struct {
	Input             courseProfessorInput
	MatchedCourseID   int
	MatchedCourseCode string
	FuzzyProfID       int
	FuzzyProfName     string
	FuzzyScore        float32
	HasFuzzyMatch     bool
	SameSubject       bool
	MatchesCourse     bool
}

type matchClassification string

const (
	matchExisting  matchClassification = "existing"
	matchNew       matchClassification = "new"
	matchAmbiguous matchClassification = "ambiguous"
)

type acceptedCourseProfessorLink struct {
	CourseID   int
	ProfID     int
	TermID     int
	ProfName   string
	FuzzyScore float32
}

type cachedProf struct {
	ID      int
	Created bool
}

type courseProfessorUploadResponse struct {
	RowsReceived        int              `json:"rows_received"`
	RowsDeduped         int              `json:"rows_deduped"`
	DuplicatesRemoved   int              `json:"duplicates_removed"`
	RowsAccepted        int              `json:"rows_accepted"`
	LinksUpserted       int64            `json:"links_upserted"`
	ExistingProfMatches int              `json:"existing_prof_matches"`
	NewProfMatches      int              `json:"new_prof_matches"`
	ProfsCreated        int              `json:"profs_created"`
	RowsRejected        int              `json:"rows_rejected"`
	InvalidRows         int              `json:"invalid_rows"`
	InvalidCourses      int              `json:"invalid_courses"`
	AmbiguousMatches    int              `json:"ambiguous_matches"`
	RejectedSamples     []uploadRowIssue `json:"rejected_samples,omitempty"`
	AmbiguousSamples    []uploadRowIssue `json:"ambiguous_samples,omitempty"`
}

const matchCourseProfessorsQuery = `
WITH input_data(row_num, scraped_prof_name, course_code, course_id, term_id) AS (
  SELECT * FROM unnest($1::int[], $2::text[], $3::text[], $4::int[], $5::int[])
),
validated AS (
  SELECT
    i.*,
    c.id AS matched_course_id,
    c.code AS matched_course_code
  FROM input_data i
    LEFT JOIN LATERAL (
      SELECT id, code
      FROM course
      WHERE (
        i.course_id > 0
        AND id = i.course_id
        AND (i.course_code = '' OR code = i.course_code)
      ) OR (
        i.course_id <= 0
        AND i.course_code <> ''
        AND code = i.course_code
      )
      LIMIT 1
    ) c ON TRUE
),
matched AS (
  SELECT
    v.*,
    p.id AS fuzzy_match_prof_id,
    p.name AS fuzzy_match_prof_name,
    similarity(p.name, v.scraped_prof_name)::real AS fuzzy_match_score,
    COALESCE(EXISTS (
      SELECT 1
      FROM prof_teaches_course ptc
        JOIN course taught ON taught.id = ptc.course_id
      WHERE ptc.prof_id = p.id
        AND SUBSTRING(taught.code FROM '^[^0-9]+') =
            SUBSTRING(v.matched_course_code FROM '^[^0-9]+')
    ), FALSE) AS same_subject,
    COALESCE(EXISTS (
      SELECT 1
      FROM prof_teaches_course ptc
      WHERE ptc.prof_id = p.id
        AND ptc.course_id = v.matched_course_id
    ), FALSE) AS matches_course
  FROM validated v
    LEFT JOIN LATERAL (
      SELECT id, name
      FROM prof
      ORDER BY similarity(name, v.scraped_prof_name) DESC
      LIMIT 1
    ) p ON TRUE
)
SELECT
  row_num,
  scraped_prof_name,
  course_code,
  course_id,
  term_id,
  matched_course_id,
  matched_course_code,
  fuzzy_match_prof_id,
  fuzzy_match_prof_name,
  fuzzy_match_score,
  same_subject,
  matches_course
FROM matched
ORDER BY row_num
`

const upsertProfQuery = `
WITH inserted AS (
  INSERT INTO prof(code, name)
  VALUES ($1, $2)
  ON CONFLICT (code) DO NOTHING
  RETURNING id
)
SELECT id, TRUE AS created
FROM inserted
UNION ALL
SELECT id, FALSE AS created
FROM prof
WHERE code = $1
  AND NOT EXISTS (SELECT 1 FROM inserted)
LIMIT 1
`

const upsertCourseProfessorLinksQuery = `
WITH input_data(course_id, prof_id, term_id, scraped_prof_name, fuzzy_match_score) AS (
  SELECT * FROM unnest($1::int[], $2::int[], $3::int[], $4::text[], $5::real[])
)
INSERT INTO scraped_prof_teaches_course(
  course_id, prof_id, term_id, source, scraped_prof_name, fuzzy_match_score
)
SELECT course_id, prof_id, term_id, $6, scraped_prof_name, fuzzy_match_score
FROM input_data
ON CONFLICT (course_id, prof_id, term_id, source) DO UPDATE SET
  scraped_prof_name = EXCLUDED.scraped_prof_name,
  fuzzy_match_score = EXCLUDED.fuzzy_match_score,
  updated_at = NOW()
`

func HandleCourseProfessorsUpload(tx *db.Tx, r *http.Request) (interface{}, error) {
	if err := requireAdminSecret(r); err != nil {
		return nil, err
	}

	source := strings.TrimSpace(r.URL.Query().Get("source"))
	if source == "" {
		source = defaultSource
	}
	if len(source) > 64 {
		return nil, serde.WithStatus(
			http.StatusBadRequest,
			fmt.Errorf("source must be at most 64 characters"),
		)
	}

	payload, err := readUploadPayload(r)
	if err != nil {
		return nil, err
	}

	parsed, err := parseCourseProfessorUpload(payload)
	if err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, err)
	}

	response := courseProfessorUploadResponse{
		RowsReceived:      parsed.RowsReceived,
		RowsDeduped:       len(parsed.Inputs),
		DuplicatesRemoved: parsed.DuplicatesRemoved,
		InvalidRows:       parsed.InvalidRows,
		RejectedSamples:   parsed.RejectedSamples,
	}
	if len(parsed.Inputs) == 0 {
		response.RowsRejected = parsed.InvalidRows
		return &response, nil
	}

	matches, err := matchCourseProfessors(tx, parsed.Inputs)
	if err != nil {
		return nil, fmt.Errorf("matching professors: %w", err)
	}

	profCache := make(map[string]cachedProf)
	var accepted []acceptedCourseProfessorLink
	for _, match := range matches {
		if match.MatchedCourseID == 0 {
			response.InvalidCourses++
			addSample(&response.RejectedSamples, uploadIssueFromMatch(match, "course not found or course_id/course_code mismatch"))
			continue
		}

		switch classifyMatch(match) {
		case matchExisting:
			response.ExistingProfMatches++
			accepted = append(
				accepted,
				acceptedCourseProfessorLink{
					CourseID:   match.MatchedCourseID,
					ProfID:     match.FuzzyProfID,
					TermID:     match.Input.TermID,
					ProfName:   match.Input.Instructor,
					FuzzyScore: match.FuzzyScore,
				},
			)
		case matchNew:
			if util.ProfNameToCode(match.Input.Instructor) == "" {
				response.InvalidRows++
				addSample(&response.RejectedSamples, uploadIssueFromMatch(match, "professor name does not produce a valid code"))
				continue
			}
			response.NewProfMatches++
			profID, created, err := upsertProf(tx, profCache, match.Input.Instructor)
			if err != nil {
				return nil, fmt.Errorf("creating professor %q: %w", match.Input.Instructor, err)
			}
			if created {
				response.ProfsCreated++
			}
			accepted = append(
				accepted,
				acceptedCourseProfessorLink{
					CourseID:   match.MatchedCourseID,
					ProfID:     profID,
					TermID:     match.Input.TermID,
					ProfName:   match.Input.Instructor,
					FuzzyScore: 1,
				},
			)
		case matchAmbiguous:
			response.AmbiguousMatches++
			addSample(&response.AmbiguousSamples, uploadIssueFromMatch(match, "ambiguous fuzzy match"))
		}
	}

	if len(accepted) > 0 {
		response.LinksUpserted, err = upsertCourseProfessorLinks(tx, accepted, source)
		if err != nil {
			return nil, fmt.Errorf("upserting course professor links: %w", err)
		}
	}

	response.RowsAccepted = len(accepted)
	response.RowsRejected = response.InvalidRows + response.InvalidCourses + response.AmbiguousMatches
	return &response, nil
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

func parseCourseProfessorUpload(payload []byte) (*parsedCourseProfessorUpload, error) {
	var rawRows []json.RawMessage
	if err := json.Unmarshal(payload, &rawRows); err != nil {
		return nil, fmt.Errorf("malformed JSON: %w", err)
	}

	var parsed parsedCourseProfessorUpload
	seen := make(map[string]bool)
	for _, raw := range rawRows {
		var term struct {
			TermID int                        `json:"term_code"`
			Data   []courseProfessorUploadRow `json:"data"`
		}
		if err := json.Unmarshal(raw, &term); err == nil && term.Data != nil {
			for _, row := range term.Data {
				row.TermID = firstNonZero(row.TermID, term.TermID)
				appendParsedUploadRow(&parsed, row, seen)
			}
			continue
		}

		var row courseProfessorUploadRow
		if err := json.Unmarshal(raw, &row); err != nil {
			parsed.InvalidRows++
			addSample(&parsed.RejectedSamples, uploadRowIssue{Reason: "malformed row"})
			continue
		}
		appendParsedUploadRow(&parsed, row, seen)
	}

	return &parsed, nil
}

func appendParsedUploadRow(parsed *parsedCourseProfessorUpload, row courseProfessorUploadRow, seen map[string]bool) {
	parsed.RowsReceived++
	input := courseProfessorInput{
		RowNum:     parsed.RowsReceived,
		TermID:     row.TermID,
		CourseCode: normalizeCourseCode(row.CourseCode),
		CourseID:   row.CourseID,
		Instructor: normalizeInstructor(row.Instructor),
	}

	if input.TermID == 0 {
		parsed.InvalidRows++
		addSample(&parsed.RejectedSamples, uploadIssueFromInput(input, "missing term_code"))
		return
	}
	if input.CourseID == 0 && input.CourseCode == "" {
		parsed.InvalidRows++
		addSample(&parsed.RejectedSamples, uploadIssueFromInput(input, "missing course_id or course_code"))
		return
	}
	if input.Instructor == "" {
		parsed.InvalidRows++
		addSample(&parsed.RejectedSamples, uploadIssueFromInput(input, "missing instructor"))
		return
	}

	parsed.ValidRows++
	key := fmt.Sprintf("%d|%d|%s|%s", input.TermID, input.CourseID, input.CourseCode, strings.ToLower(input.Instructor))
	if seen[key] {
		parsed.DuplicatesRemoved++
		return
	}
	seen[key] = true
	parsed.Inputs = append(parsed.Inputs, input)
}

func normalizeCourseCode(courseCode string) string {
	return strings.ToLower(strings.Join(strings.Fields(strings.TrimSpace(courseCode)), ""))
}

func normalizeInstructor(name string) string {
	return strings.Join(strings.Fields(strings.TrimRight(strings.TrimSpace(name), ", ")), " ")
}

func firstNonZero(values ...int) int {
	for _, value := range values {
		if value != 0 {
			return value
		}
	}
	return 0
}

func matchCourseProfessors(tx *db.Tx, inputs []courseProfessorInput) ([]courseProfessorMatch, error) {
	rowNums := make([]int, len(inputs))
	profNames := make([]string, len(inputs))
	courseCodes := make([]string, len(inputs))
	courseIDs := make([]int, len(inputs))
	termIDs := make([]int, len(inputs))
	for i, input := range inputs {
		rowNums[i] = input.RowNum
		profNames[i] = input.Instructor
		courseCodes[i] = input.CourseCode
		courseIDs[i] = input.CourseID
		termIDs[i] = input.TermID
	}

	rows, err := tx.Query(matchCourseProfessorsQuery, rowNums, profNames, courseCodes, courseIDs, termIDs)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	inputByRow := make(map[int]courseProfessorInput, len(inputs))
	for _, input := range inputs {
		inputByRow[input.RowNum] = input
	}

	matches := make([]courseProfessorMatch, 0, len(inputs))
	for rows.Next() {
		var (
			rowNum            int
			scrapedProfName   string
			courseCode        string
			courseID          int
			termID            int
			matchedCourseID   pgtype.Int4
			matchedCourseCode pgtype.Text
			fuzzyProfID       pgtype.Int4
			fuzzyProfName     pgtype.Text
			fuzzyScore        pgtype.Float4
			sameSubject       bool
			matchesCourse     bool
		)
		if err := rows.Scan(
			&rowNum,
			&scrapedProfName,
			&courseCode,
			&courseID,
			&termID,
			&matchedCourseID,
			&matchedCourseCode,
			&fuzzyProfID,
			&fuzzyProfName,
			&fuzzyScore,
			&sameSubject,
			&matchesCourse,
		); err != nil {
			return nil, err
		}

		input := inputByRow[rowNum]
		input.Instructor = scrapedProfName
		input.CourseCode = courseCode
		input.CourseID = courseID
		input.TermID = termID

		match := courseProfessorMatch{
			Input:         input,
			SameSubject:   sameSubject,
			MatchesCourse: matchesCourse,
		}
		if matchedCourseID.Valid {
			match.MatchedCourseID = int(matchedCourseID.Int32)
		}
		if matchedCourseCode.Valid {
			match.MatchedCourseCode = matchedCourseCode.String
		}
		if fuzzyProfID.Valid {
			match.FuzzyProfID = int(fuzzyProfID.Int32)
			match.HasFuzzyMatch = true
		}
		if fuzzyProfName.Valid {
			match.FuzzyProfName = fuzzyProfName.String
		}
		if fuzzyScore.Valid {
			match.FuzzyScore = fuzzyScore.Float32
		}
		matches = append(matches, match)
	}
	if rows.Err() != nil {
		return nil, rows.Err()
	}
	return matches, nil
}

func classifyMatch(match courseProfessorMatch) matchClassification {
	if !match.HasFuzzyMatch {
		return matchNew
	}
	if match.FuzzyScore >= 0.999999 {
		return matchExisting
	}
	if match.FuzzyScore >= fuzzyThreshold {
		if match.SameSubject {
			return matchExisting
		}
		return matchAmbiguous
	}
	if match.SameSubject {
		return matchAmbiguous
	}
	return matchNew
}

func upsertProf(tx *db.Tx, cache map[string]cachedProf, name string) (int, bool, error) {
	code := util.ProfNameToCode(name)
	if code == "" {
		return 0, false, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("professor name %q does not produce a valid code", name))
	}
	if cached, ok := cache[code]; ok {
		return cached.ID, false, nil
	}

	var prof cachedProf
	err := tx.QueryRow(upsertProfQuery, code, name).Scan(&prof.ID, &prof.Created)
	if err != nil {
		return 0, false, err
	}
	cache[code] = prof
	return prof.ID, prof.Created, nil
}

func upsertCourseProfessorLinks(tx *db.Tx, links []acceptedCourseProfessorLink, source string) (int64, error) {
	courseIDs := make([]int, len(links))
	profIDs := make([]int, len(links))
	termIDs := make([]int, len(links))
	profNames := make([]string, len(links))
	fuzzyScores := make([]float32, len(links))
	for i, link := range links {
		courseIDs[i] = link.CourseID
		profIDs[i] = link.ProfID
		termIDs[i] = link.TermID
		profNames[i] = link.ProfName
		fuzzyScores[i] = link.FuzzyScore
	}

	tag, err := tx.Exec(upsertCourseProfessorLinksQuery, courseIDs, profIDs, termIDs, profNames, fuzzyScores, source)
	if err != nil {
		return 0, err
	}
	return tag.RowsAffected(), nil
}

func uploadIssueFromInput(input courseProfessorInput, reason string) uploadRowIssue {
	return uploadRowIssue{
		RowNum:     input.RowNum,
		Reason:     reason,
		TermID:     input.TermID,
		CourseCode: input.CourseCode,
		CourseID:   input.CourseID,
		Instructor: input.Instructor,
	}
}

func uploadIssueFromMatch(match courseProfessorMatch, reason string) uploadRowIssue {
	score := match.FuzzyScore
	issue := uploadIssueFromInput(match.Input, reason)
	issue.MatchedProfName = match.FuzzyProfName
	issue.MatchedProfID = match.FuzzyProfID
	issue.SameSubject = match.SameSubject
	issue.MatchesCourse = match.MatchesCourse
	if match.HasFuzzyMatch {
		issue.FuzzyScore = &score
	}
	return issue
}

func addSample(samples *[]uploadRowIssue, issue uploadRowIssue) {
	if len(*samples) >= sampleLimit {
		return
	}
	*samples = append(*samples, issue)
}
