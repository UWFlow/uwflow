package admin

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"sort"
	"strings"
	"time"

	"flow/api/serde"
	"flow/common/db"
	"flow/common/util"
)

const scrapedAtLayout = "2006-01-02 03:04 PM"

var (
	courseCodePattern = regexp.MustCompile(`^[a-z0-9]+$`)
	scrapedAtPattern  = regexp.MustCompile(`^\d{4}-\d{2}-\d{2} \d{2}:\d{2} (AM|PM)$`)
)

type rawTerm struct {
	TermCode *int         `json:"term_code"`
	TermName *string      `json:"term_name"`
	Data     *[]rawRecord `json:"data"`
}

type rawRecord struct {
	CourseCode *string `json:"course_code"`
	CourseID   *int    `json:"course_id"`
	Instructor *string `json:"instructor"`
	ScrapedAt  *string `json:"scraped_at"`
}

type teachingRecord struct {
	termCode   int
	termName   string
	courseCode string
	courseID   int
	instructor string
	profCode   string
	scrapedAt  time.Time
	path       string
}

type termReference struct {
	path string
}

type courseReference struct {
	code string
	path string
}

type validatedPayload struct {
	records         []teachingRecord
	terms           map[int]termReference
	courses         map[int]courseReference
	recordsReceived int
}

type validationDetail struct {
	Path    string `json:"path"`
	Message string `json:"message"`
}

type teachingKey struct {
	termCode   int
	courseID   int
	instructor string
}

type ingestResponse struct {
	TermsProcessed    int `json:"terms_processed"`
	RecordsReceived   int `json:"records_received"`
	UniqueRecords     int `json:"unique_records"`
	ProfessorsCreated int `json:"professors_created"`
	RecordsWritten    int `json:"records_written"`
}

const insertProfessorsQuery = `
WITH input(name, code) AS (
  SELECT * FROM UNNEST($1::text[], $2::text[])
)
INSERT INTO public.prof(name, code)
SELECT input.name, input.code
FROM input
LEFT JOIN public.prof_remap remap ON remap.code = input.code
LEFT JOIN public.prof ON prof.code = input.code
WHERE remap.prof_id IS NULL AND prof.id IS NULL
ON CONFLICT (code) DO NOTHING
`

const upsertTeachingRecordsQuery = `
WITH input(
  term_code, term_name, course_id, course_code,
  instructor, prof_code, scraped_at
) AS (
  SELECT * FROM UNNEST(
    $1::int[], $2::text[], $3::int[], $4::text[],
    $5::text[], $6::text[], $7::timestamp[]
  )
), resolved AS (
  SELECT
    input.term_code,
    input.term_name,
    input.course_id,
    input.course_code,
    input.instructor,
    COALESCE(remap.prof_id, prof.id) AS prof_id,
    input.scraped_at
  FROM input
  LEFT JOIN public.prof_remap remap ON remap.code = input.prof_code
  LEFT JOIN public.prof prof ON prof.code = input.prof_code
)
INSERT INTO public.prof_teaches_course_ingestion(
  term_code, term_name, course_id, course_code,
  instructor, prof_id, scraped_at
)
SELECT
  term_code, term_name, course_id, course_code,
  instructor, prof_id, scraped_at
FROM resolved
ON CONFLICT (term_code, course_id, instructor) DO UPDATE SET
  term_name = EXCLUDED.term_name,
  course_code = EXCLUDED.course_code,
  prof_id = EXCLUDED.prof_id,
  scraped_at = EXCLUDED.scraped_at,
  ingested_at = NOW()
WHERE (
  prof_teaches_course_ingestion.term_name,
  prof_teaches_course_ingestion.course_code,
  prof_teaches_course_ingestion.prof_id,
  prof_teaches_course_ingestion.scraped_at
) IS DISTINCT FROM (
  EXCLUDED.term_name,
  EXCLUDED.course_code,
  EXCLUDED.prof_id,
  EXCLUDED.scraped_at
)
`

func IngestProfTeaches(tx *db.Tx, r *http.Request) (interface{}, error) {
	payload, details, err := decodeAndValidate(r.Body)
	if err != nil {
		var maxBytesErr *http.MaxBytesError
		if errors.As(err, &maxBytesErr) {
			return nil, validationError(
				http.StatusRequestEntityTooLarge,
				[]validationDetail{{Path: "$", Message: "request body exceeds 10 MiB"}},
			)
		}
		return nil, validationError(
			http.StatusBadRequest,
			[]validationDetail{{Path: "$", Message: err.Error()}},
		)
	}
	if len(details) > 0 {
		return nil, validationError(http.StatusBadRequest, details)
	}

	details, err = validateReferences(tx, payload)
	if err != nil {
		return nil, fmt.Errorf("validating database references: %w", err)
	}
	if len(details) > 0 {
		return nil, validationError(http.StatusBadRequest, details)
	}

	response := ingestResponse{
		TermsProcessed:  len(payload.terms),
		RecordsReceived: payload.recordsReceived,
		UniqueRecords:   len(payload.records),
	}
	if len(payload.records) == 0 {
		return response, nil
	}

	profNames, profCodes := uniqueProfessors(payload.records)
	inserted, err := tx.Exec(insertProfessorsQuery, profNames, profCodes)
	if err != nil {
		return nil, fmt.Errorf("inserting professors: %w", err)
	}
	response.ProfessorsCreated = int(inserted.RowsAffected())

	termCodes := make([]int, len(payload.records))
	termNames := make([]string, len(payload.records))
	courseIDs := make([]int, len(payload.records))
	courseCodes := make([]string, len(payload.records))
	instructors := make([]string, len(payload.records))
	recordProfCodes := make([]string, len(payload.records))
	scrapedAt := make([]time.Time, len(payload.records))
	for i, record := range payload.records {
		termCodes[i] = record.termCode
		termNames[i] = record.termName
		courseIDs[i] = record.courseID
		courseCodes[i] = record.courseCode
		instructors[i] = record.instructor
		recordProfCodes[i] = record.profCode
		scrapedAt[i] = record.scrapedAt
	}

	written, err := tx.Exec(
		upsertTeachingRecordsQuery,
		termCodes,
		termNames,
		courseIDs,
		courseCodes,
		instructors,
		recordProfCodes,
		scrapedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("upserting teaching records: %w", err)
	}
	response.RecordsWritten = int(written.RowsAffected())

	return response, nil
}

func decodeAndValidate(body io.Reader) (validatedPayload, []validationDetail, error) {
	var payload validatedPayload
	var rawTerms *[]rawTerm

	decoder := json.NewDecoder(body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&rawTerms); err != nil {
		return payload, nil, fmt.Errorf("invalid JSON: %w", err)
	}
	if rawTerms == nil {
		return payload, nil, fmt.Errorf("top-level value must be an array")
	}
	if err := decoder.Decode(&struct{}{}); err != io.EOF {
		return payload, nil, fmt.Errorf("request body must contain exactly one JSON value")
	}

	payload.terms = make(map[int]termReference)
	payload.courses = make(map[int]courseReference)
	seenRecords := make(map[teachingKey]int)
	termNames := make(map[int]string)
	var details []validationDetail

	for termIndex, rawTerm := range *rawTerms {
		termPath := fmt.Sprintf("$[%d]", termIndex)
		termValid := true

		if rawTerm.TermCode == nil {
			details = append(details, required(termPath+".term_code", "integer"))
			termValid = false
		} else if *rawTerm.TermCode <= 0 {
			details = append(details, validationDetail{
				Path: termPath + ".term_code", Message: "must be greater than zero",
			})
			termValid = false
		}

		termName := ""
		if rawTerm.TermName == nil {
			details = append(details, required(termPath+".term_name", "string"))
			termValid = false
		} else {
			termName = strings.TrimSpace(*rawTerm.TermName)
			if termName == "" {
				details = append(details, validationDetail{
					Path: termPath + ".term_name", Message: "must not be empty",
				})
				termValid = false
			} else if len(termName) > 256 {
				details = append(details, validationDetail{
					Path: termPath + ".term_name", Message: "must be at most 256 bytes",
				})
				termValid = false
			}
		}

		if rawTerm.Data == nil {
			details = append(details, required(termPath+".data", "array"))
			continue
		}

		if termValid {
			termCode := *rawTerm.TermCode
			if existingName, ok := termNames[termCode]; ok && existingName != termName {
				details = append(details, validationDetail{
					Path: termPath + ".term_name",
					Message: fmt.Sprintf(
						"conflicts with another name for term_code %d", termCode,
					),
				})
				termValid = false
			} else {
				termNames[termCode] = termName
				payload.terms[termCode] = termReference{
					path: termPath + ".term_code",
				}
			}
		}

		for recordIndex, rawRecord := range *rawTerm.Data {
			payload.recordsReceived++
			recordPath := fmt.Sprintf("%s.data[%d]", termPath, recordIndex)
			record, recordDetails := validateRecord(rawRecord, recordPath)
			details = append(details, recordDetails...)
			if !termValid || len(recordDetails) > 0 {
				continue
			}

			record.termCode = *rawTerm.TermCode
			record.termName = termName
			record.path = recordPath

			if existing, ok := payload.courses[record.courseID]; ok {
				if existing.code != record.courseCode {
					details = append(details, validationDetail{
						Path: recordPath + ".course_code",
						Message: fmt.Sprintf(
							"conflicts with %s for course_id %d",
							existing.path+".course_code", record.courseID,
						),
					})
					continue
				}
			} else {
				payload.courses[record.courseID] = courseReference{
					code: record.courseCode, path: recordPath,
				}
			}

			key := teachingKey{
				termCode: record.termCode, courseID: record.courseID,
				instructor: record.instructor,
			}
			if existingIndex, ok := seenRecords[key]; ok {
				if record.scrapedAt.After(payload.records[existingIndex].scrapedAt) {
					payload.records[existingIndex].scrapedAt = record.scrapedAt
				}
				continue
			}
			seenRecords[key] = len(payload.records)
			payload.records = append(payload.records, record)
		}
	}

	return payload, details, nil
}

func validateRecord(raw rawRecord, path string) (teachingRecord, []validationDetail) {
	var record teachingRecord
	var details []validationDetail

	if raw.CourseCode == nil {
		details = append(details, required(path+".course_code", "string"))
	} else {
		record.courseCode = *raw.CourseCode
		if len(record.courseCode) == 0 {
			details = append(details, validationDetail{
				Path: path + ".course_code", Message: "must not be empty",
			})
		} else if len(record.courseCode) > 16 {
			details = append(details, validationDetail{
				Path: path + ".course_code", Message: "must be at most 16 bytes",
			})
		} else if !courseCodePattern.MatchString(record.courseCode) {
			details = append(details, validationDetail{
				Path:    path + ".course_code",
				Message: "must be a lowercase compact course code",
			})
		}
	}

	if raw.CourseID == nil {
		details = append(details, required(path+".course_id", "integer"))
	} else if *raw.CourseID <= 0 {
		details = append(details, validationDetail{
			Path: path + ".course_id", Message: "must be greater than zero",
		})
	} else {
		record.courseID = *raw.CourseID
	}

	if raw.Instructor == nil {
		details = append(details, required(path+".instructor", "string"))
	} else {
		record.instructor = strings.TrimSpace(*raw.Instructor)
		if record.instructor == "" {
			details = append(details, validationDetail{
				Path: path + ".instructor", Message: "must not be empty",
			})
		} else if len(record.instructor) > 256 {
			details = append(details, validationDetail{
				Path: path + ".instructor", Message: "must be at most 256 bytes",
			})
		} else {
			record.profCode = util.ProfNameToCode(record.instructor)
			if record.profCode == "" {
				details = append(details, validationDetail{
					Path:    path + ".instructor",
					Message: "must contain at least one Latin letter",
				})
			}
		}
	}

	if raw.ScrapedAt == nil {
		details = append(details, required(path+".scraped_at", "string"))
	} else if !scrapedAtPattern.MatchString(*raw.ScrapedAt) {
		details = append(details, validationDetail{
			Path:    path + ".scraped_at",
			Message: "must match YYYY-MM-DD HH:MM AM/PM",
		})
	} else {
		parsed, err := time.Parse(scrapedAtLayout, *raw.ScrapedAt)
		if err != nil {
			details = append(details, validationDetail{
				Path: path + ".scraped_at", Message: "must be a valid date and time",
			})
		} else {
			record.scrapedAt = parsed
		}
	}

	return record, details
}

func validateReferences(
	tx *db.Tx, payload validatedPayload,
) ([]validationDetail, error) {
	var details []validationDetail

	termIDs := make([]int, 0, len(payload.terms))
	for termID := range payload.terms {
		termIDs = append(termIDs, termID)
	}
	sort.Ints(termIDs)
	if len(termIDs) > 0 {
		rows, err := tx.Query(`SELECT id FROM public.term WHERE id = ANY($1::int[])`, termIDs)
		if err != nil {
			return nil, err
		}
		found := make(map[int]bool, len(termIDs))
		for rows.Next() {
			var id int
			if err := rows.Scan(&id); err != nil {
				rows.Close()
				return nil, err
			}
			found[id] = true
		}
		if err := rows.Err(); err != nil {
			rows.Close()
			return nil, err
		}
		rows.Close()
		for _, id := range termIDs {
			if !found[id] {
				details = append(details, validationDetail{
					Path:    payload.terms[id].path,
					Message: fmt.Sprintf("term_code %d does not exist", id),
				})
			}
		}
	}

	courseIDs := make([]int, 0, len(payload.courses))
	for courseID := range payload.courses {
		courseIDs = append(courseIDs, courseID)
	}
	sort.Ints(courseIDs)
	if len(courseIDs) > 0 {
		rows, err := tx.Query(
			`SELECT id, code FROM public.course WHERE id = ANY($1::int[])`,
			courseIDs,
		)
		if err != nil {
			return nil, err
		}
		found := make(map[int]string, len(courseIDs))
		for rows.Next() {
			var id int
			var code string
			if err := rows.Scan(&id, &code); err != nil {
				rows.Close()
				return nil, err
			}
			found[id] = code
		}
		if err := rows.Err(); err != nil {
			rows.Close()
			return nil, err
		}
		rows.Close()
		for _, id := range courseIDs {
			reference := payload.courses[id]
			code, ok := found[id]
			if !ok {
				details = append(details, validationDetail{
					Path:    reference.path + ".course_id",
					Message: fmt.Sprintf("course_id %d does not exist", id),
				})
			} else if code != reference.code {
				details = append(details, validationDetail{
					Path: reference.path + ".course_code",
					Message: fmt.Sprintf(
						"course_id %d belongs to %q, not %q", id, code, reference.code,
					),
				})
			}
		}
	}

	return details, nil
}

func uniqueProfessors(records []teachingRecord) ([]string, []string) {
	byCode := make(map[string]string)
	for _, record := range records {
		if _, exists := byCode[record.profCode]; !exists {
			byCode[record.profCode] = record.instructor
		}
	}

	codes := make([]string, 0, len(byCode))
	for code := range byCode {
		codes = append(codes, code)
	}
	sort.Strings(codes)

	names := make([]string, len(codes))
	for i, code := range codes {
		names[i] = byCode[code]
	}
	return names, codes
}

func required(path, expectedType string) validationDetail {
	return validationDetail{
		Path: path, Message: fmt.Sprintf("is required and must be a %s", expectedType),
	}
}

func validationError(status int, details []validationDetail) error {
	return serde.WithDetails(
		details,
		serde.WithEnum(
			serde.ValidationFailed,
			serde.WithStatus(status, fmt.Errorf("ingestion payload failed validation")),
		),
	)
}
