// GEMINI
package admin

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time" // For logging timestamps

	"flow/common/db"
)

type ProfTeachesTerm struct {
	TermCode int                  `json:"term_code"`
	TermName string               `json:"term_name"`
	Data     []CourseInstructorData `json:"data"`
}

// Represents an entry within the "data" array
type CourseInstructorData struct {
	CourseCode string `json:"course_code"`
	CourseID   int    `json:"course_id"`   // Assuming course_id is always present and an int
	Instructor string `json:"instructor"`
	ScrapedAt  string `json:"scraped_at"` // Keep as string for simplicity unless date parsing is needed
}

// Represents the flattened structure used for processing
type FlatInstructorRecord struct {
	TermCode    int
	CourseCode  string // Cleaned: lowercased, trimmed
	CourseID    int
	Instructor  string // Cleaned: trimmed, trailing comma removed
	ScrapedAt   string
	// We will add the fuzzy match results to this or a related struct later
}

// Represents the result row from the fuzzy matching SQL query
type FuzzyMatchResult struct {
	ScrapedProfName      string         `db:"scraped_prof_name"`
	MatchedProfName      string         `db:"prof_name"` // Use sql.NullString for potentially NULL matches
	courseID    int            `db:"course_id"`
	courseCode  string         `db:"validated_course_code"`
	AllProfCourses       []string       `db:"all_prof_courses"` // Use pq.StringArray for text[]
	TermCode             int            `db:"term_code"`
	FuzzyMatchProfID     int            `db:"fuzzy_match_prof_id"` // Use sql.NullInt64 for potentially NULL matches
	FuzzyMatchScore      float32 		`db:"fuzzy_match_score"` // Use sql.NullFloat64 for potentially NULL matches
	OriginalInstructorName string        `db:"original_instructor_name"`

	// Fields calculated after fetching
	SameSubject bool // This is useful for ambiguous matches
}

// Using a map to hold categorized results, similar to Python structure
type CategorizedMatches map[string][]FuzzyMatchResult

// Helper function to split course code (e.g., "acc760" -> "acc", "760")
// Adjust logic based on actual course code formats if needed.
func splitCourseCode(code string) (subject string, number string) {
	// Simple split assuming format like "SUBJ123" or "SUBJ123A"
	// Find the index of the first digit
	firstDigitIndex := -1
	for i, r := range code {
		if r >= '0' && r <= '9' {
			firstDigitIndex = i
			break
		}
	}

	if firstDigitIndex > 0 && firstDigitIndex < len(code) {
		return strings.ToUpper(code[:firstDigitIndex]), code[firstDigitIndex:]
	}
	// Fallback or error handling if format is unexpected
	return strings.ToUpper(code), "" // Or return an error
}


const (
	// Ensure pg_trgm extension and index exist (run once or use migrations)
	createTrgmExtensionSQL = `CREATE EXTENSION IF NOT EXISTS pg_trgm;`
	createTrgmIndexSQL     = `CREATE INDEX IF NOT EXISTS idx_prof_name_trgm ON prof USING GIN (name gin_trgm_ops);`
)

func IngestProfData(tx *db.Tx, r *http.Request) (interface{}, error) {

	var reuslt log.Db


	// 1. Decode JSON request body
	var inputTerms []ProfTeachesTerm

	// Use shallow copy of request body to avoid issues if it's read elsewhere
	bodyDecoder := json.NewDecoder(r.Body)
	if err := bodyDecoder.Decode(&inputTerms); err != nil {
		return nil, fmt.Errorf("decoding JSON body: %w", err)
	}
	log.Printf("Decoded %d terms from request body.", len(inputTerms))

	// 2. Flatten JSON data and perform basic cleaning
	flattenedData := transformJSONToFlatRecords(inputTerms)
	if len(flattenedData) == 0 {
		log.Println("No valid instructor records found after flattening.")
		return nil, nil
	}
	log.Printf("Flattened into %d instructor records.", len(flattenedData))
	// Add detailed logging of each record
	for i, record := range flattenedData {
		log.Printf("Record %d: TermCode=%d, CourseCode=%s, CourseID=%d, Instructor=%s, ScrapedAt=%s",
			i+1,
			record.TermCode,
			record.CourseCode,
			record.CourseID,
			record.Instructor,
			record.ScrapedAt)
	}

	// 3. Ensure DB prerequisites (Extension and Index)
	// These are idempotent, so running them here is acceptable, but migrations are better.
	if _, err := tx.Exec(createTrgmExtensionSQL); err != nil {
		return nil, fmt.Errorf("ensuring pg_trgm extension exists: %w", err)
	}
	if _, err := tx.Exec(createTrgmIndexSQL); err != nil {
		return nil, fmt.Errorf("ensuring prof name trigram index exists: %w", err)
	}

	// 4. Perform Fuzzy Matching and Categorization
	categorizedResults, err := performFuzzyMatching(tx, flattenedData)
	if err != nil {
		return nil, fmt.Errorf("performing fuzzy matching: %w", err) // Error already wrapped in performFuzzyMatching
	}

	// 7. Log Summary and Respond
	log.Printf("Fuzzy matching completed in %v.", time.Since(startTime))
	log.Printf("Categorization results: Existing=%d, New=%d, Ambiguous=%d",
		len(categorizedResults["existing"]),
		len(categorizedResults["new"]),
		len(categorizedResults["ambiguous"]),
	)

	// The Python script didn't return data, just logged and wrote files/truncated table.
	// We'll return a success message with the counts.
	response := map[string]interface{}{
		"message":            "Ingestion and fuzzy matching processed.",
		"total_records":      len(flattenedData),
		"existing_matches":   len(categorizedResults["existing"]),
		"new_prof_matches":   len(categorizedResults["new"]),
		"ambiguous_matches":  len(categorizedResults["ambiguous"]),
		"processing_duration": time.Since(startTime).String(),
	}
	return response, nil
}

// transformJSONToFlatRecords takes the nested JSON structure and flattens it.
func transformJSONToFlatRecords(terms []ProfTeachesTerm) []FlatInstructorRecord {
	var rows []FlatInstructorRecord
	for _, term := range terms {
		for _, d := range term.Data {
			instructorName := strings.TrimSpace(d.Instructor)
			instructorName = strings.TrimSuffix(instructorName, ",")
			instructorName = strings.TrimSpace(instructorName)

			rows = append(rows, FlatInstructorRecord{
				TermCode:   term.TermCode,
				CourseCode: strings.ToLower(strings.TrimSpace(d.CourseCode)),
				CourseID:   d.CourseID,
				Instructor: instructorName,
				ScrapedAt:  d.ScrapedAt,
			})
		}
	}
	return rows
}

// performFuzzyMatching queries the DB to find matches and categorizes them.
func performFuzzyMatching(tx *db.Tx, records []FlatInstructorRecord) (CategorizedMatches, error) {
	// Prepare data for the query parameters (using unique combinations isn't strictly necessary
	// with the LATERAL JOIN approach, as it processes each input row, but it might reduce
	// redundant processing slightly if many duplicate instructor/course pairs exist per term).
	// For simplicity and closer match to Python's unnest call, we'll pass all records.

	// Prepare data for the query parameters	
	profNames := make([]string, len(records))
	courseCodes := make([]string, len(records))
	courseIDs := make([]int, len(records)) // Assuming int IDs
	termCodes := make([]int, len(records)) // Assuming int term codes
	for i, r := range records {
		profNames[i] = r.Instructor
		courseCodes[i] = r.CourseCode
		courseIDs[i] = r.CourseID
		termCodes[i] = r.TermCode
	}

	log.Printf("Executing fuzzy match query for %d records...", len(records))

	fuzzyMatchProfSQL := `
	WITH input_data(prof_name, course_code, course_id, term_code) AS (
		SELECT * FROM unnest($1::text[], $2::text[], $3::int[], $4::int[])
	)
	SELECT
		i.prof_name as scraped_prof_name,
		p.name as prof_name,
		p.id as fuzzy_match_prof_id,
		i.course_id as validated_course_id,
		i.course_code as validated_course_code,
		ARRAY(
			SELECT c.code
			FROM prof_teaches_course ptc
			JOIN course c ON c.id = ptc.course_id
			WHERE ptc.prof_id = p.id
			ORDER BY c.code
		) AS all_prof_courses,
		similarity(p.name, i.prof_name) AS fuzzy_match_score
	FROM input_data AS i
	LEFT JOIN LATERAL (
		SELECT id, name
		FROM prof
		ORDER BY similarity(name, i.prof_name) DESC
		LIMIT 1
	) AS p ON TRUE
	ORDER BY i.prof_name, i.course_code;
	`
	rows, err := tx.Query(fuzzyMatchProfSQL, profNames, courseCodes, courseIDs, termCodes)
	if err != nil {
		return nil, fmt.Errorf("executing fuzzy match SQL: %w", err)
	}
	defer rows.Close()

	var matches []FuzzyMatchResult
	recordIndex := 0 // To link back to original instructor name
	
	for rows.Next() {
		var m FuzzyMatchResult
		err := rows.Scan(
			&m.ScrapedProfName,
			&m.MatchedProfName,
			&m.FuzzyMatchProfID,
			&m.courseID,
			&m.courseCode,
			&m.AllProfCourses,
			&m.FuzzyMatchScore,
		)
		if err != nil {
			return nil, fmt.Errorf("scanning fuzzy match result row: %w", err)
		}

		// Calculate `same_subject` and `matches_course`
		subj, _ := splitCourseCode(m.courseCode)
		existingSubjs := make(map[string]bool)
		for _, courseCode := range m.AllProfCourses {
			s, _ := splitCourseCode(courseCode)
			existingSubjs[s] = true
		}
		m.SameSubject = existingSubjs[subj]
		matches = append(matches, m)
		recordIndex++
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating fuzzy match result rows: %w", err)
	}

	log.Printf("Fetched %d potential matches from database.", len(matches))

	// Categorize results
	prof_existing := make([]FuzzyMatchResult, 0)
	prof_new := make([]FuzzyMatchResult, 0)
	prof_ambiguous := make([]FuzzyMatchResult, 0)

	for _, m := range matches {
		// Check if similarityScore is valid before accessing Value
		similarityScore := m.FuzzyMatchScore
		if similarityScore == 1.0 {
			prof_existing = append(prof_existing, m)
		} else if similarityScore >= 0.6 {
			if m.SameSubject {
				// This should default to the existing prof
				prof_existing = append(prof_existing, m)
			} else {
				prof_ambiguous = append(prof_ambiguous, m)
			}
		} else { // score < 0.6
			if m.SameSubject {
				// Python logic puts score < 0.6 AND same_subject into 'ambiguous_matches'
				prof_ambiguous = append(prof_ambiguous, m)
			} else {
				// Python logic puts score < 0.6 AND NOT same_subject into 'new_profs'
				prof_new = append(prof_new, m)
			}
		}
	}

	// Insert New Profs
	insertNewProfsSQL := `
	WITH new_prof_data(name) AS (
		SELECT unnest($1::text[])
	)
	INSERT INTO prof (name)
	SELECT name
	FROM new_prof_data
	ON CONFLICT DO NOTHING
	`

	for _, m := range prof_new {

	// Create the categorized matches map to return
	categorizedMatches := CategorizedMatches{
		"existing":  prof_existing,
		"new":       prof_new,
		"ambiguous": prof_ambiguous,
	}

	// Write the categorized results as JSON objects to files
	if err := writeResultsToJSON(categorizedMatches); err != nil {
		log.Printf("Warning: Failed to write results to JSON files: %v", err)
		// Continue processing even if writing fails
	}

	return categorizedMatches, nil
}

// writeResultsToJSON writes the categorized match results to JSON files
func writeResultsToJSON(results CategorizedMatches) error {
	// Create a directory to store the results if it doesn't exist
	const resultsDir = "prof_match_results"
	if err := os.MkdirAll(resultsDir, 0755); err != nil {
		return fmt.Errorf("creating results directory: %w", err)
	}

	// Write each category to its own file
	for category, matches := range results {
		filename := fmt.Sprintf("%s/%s_matches.json", resultsDir, category)
		
		// Marshal the matches to JSON with indentation for readability
		jsonData, err := json.MarshalIndent(matches, "", "  ")
		if err != nil {
			return fmt.Errorf("marshaling %s matches to JSON: %w", category, err)
		}
		
		// Write the JSON data to the file
		if err := os.WriteFile(filename, jsonData, 0644); err != nil {
			return fmt.Errorf("writing %s matches to file: %w", category, err)
		}
		
		log.Printf("Wrote %d %s matches to %s", len(matches), category, filename)
	}
	
	return nil
}
