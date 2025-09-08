// GEMINI
package admin

import (
	"encoding/json"
	"fmt"
	"net/http"

	"flow/common/db"
	"flow/common/util"
	"flow/importer/uw/log"
)

type profCourseEntry struct {
	ProfName  string
	CourseID    int      
}




func IngestProfData(tx *db.Tx, r *http.Request) (interface{}, error) {
	var body []profCourseEntry
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		return nil, fmt.Errorf("failed to decode JSON body: %w", err)
	}

	var result log.DbResult
	
	err = tx.Begin()
	if err != nil {
		return &result, fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()	

	// Create staging table
	_, err = tx.Exec(`
		CREATE TABLE work.raw_staging_table (
			prof_name TEXT NOT NULL,
			course_id INT NOT NULL,
			CONSTRAINT raw_staging_table_pkey PRIMARY KEY (prof_name, course_id)
		);
	`)
	if err != nil {
		return &result, fmt.Errorf("failed to create work table: %w", err)
	}

	// Prepare and copy data
	preparedProfTeachesCourse := make([][]interface{}, len(body))
	for i, profCourse := range body {
		preparedProfTeachesCourse[i] = util.AsSlice(profCourse)
	}

	_, err = tx.CopyFrom(
		db.Identifier{"work", "raw_staging_table"},
		util.Fields(profCourseEntry{}),
		preparedProfTeachesCourse,
	)
	if err != nil {
		return &result, fmt.Errorf("failed to copy data to staging table: %w", err)
	}

	// Create trigram extension and index if they don't exist
	_, err = tx.Exec(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`)
	if err != nil {
		return &result, fmt.Errorf("failed to create pg_trgm extension: %w", err)
	}

	_, err = tx.Exec(`CREATE INDEX IF NOT EXISTS idx_prof_name_trgm ON prof USING GIN (name gin_trgm_ops);`)
	if err != nil {
		return &result, fmt.Errorf("failed to create trigram index: %w", err)
	}

	// Execute the matching and categorization query
	_, err = tx.Exec(`
		WITH dataWithCourseCode AS (
			SELECT 
				raw_data.prof_name,
				raw_data.course_id,
				c.code AS course_code
			FROM
				work.raw_staging_table raw_data
			JOIN course c ON raw_data.course_id = c.id
		),
		RankedSimilarities AS (
			SELECT
				raw_data.prof_name,
				raw_data.course_id,
				raw_data.course_code,
				best_match_query.id AS best_matched_prof_id,
				best_match_query.name AS best_matched_prof_name,
				similarity(best_match_query.name, raw_data.prof_name) as similarity_score
			FROM
				dataWithCourseCode raw_data
			CROSS JOIN LATERAL (
				SELECT id, name
				FROM prof
				ORDER BY similarity(name, raw_data.prof_name) DESC
				LIMIT 1
			) AS best_match_query
		),
		SubjectMatches AS (
			SELECT
				rs.prof_name, 
				rs.course_id,
				rs.best_matched_prof_id,
				rs.best_matched_prof_name,
				rs.similarity_score,
				CASE 
					WHEN substring(rs.course_code FROM '^[[:alpha:]]+') IN (
						SELECT substring(c.code FROM '^[[:alpha:]]+')
						FROM prof_teaches_course ptc
						JOIN course c ON c.id = ptc.course_id
						WHERE ptc.prof_id = rs.best_matched_prof_id
					) THEN TRUE 
					ELSE FALSE
				END AS subject_match
			FROM
				RankedSimilarities rs
		)
		INSERT INTO work.prof_teaches_course_delta (prof_id, course_id, category, similarity)
		SELECT
			sm.best_matched_prof_id,
			sm.course_id,
			CASE 
				WHEN sm.similarity_score = 1.0 THEN 'INSERT'::work.prof_teaches_course_category
				WHEN sm.similarity_score > 0.6 AND sm.subject_match THEN 'INSERT'::work.prof_teaches_course_category
				WHEN sm.similarity_score > 0.6 AND NOT sm.subject_match THEN 'AMBIGUOUS'::work.prof_teaches_course_category
				WHEN sm.similarity_score <= 0.6 AND sm.subject_match THEN 'AMBIGUOUS'::work.prof_teaches_course_category
				WHEN sm.similarity_score <= 0.6 AND NOT sm.subject_match THEN 'INSERT_AND_ADD_PROF'::work.prof_teaches_course_category
				ELSE 'IGNORE'::work.prof_teaches_course_category
			END AS category,
			sm.similarity_score
		FROM
			SubjectMatches sm;
	`)
	if err != nil {
		return &result, fmt.Errorf("failed to process and categorize matches: %w", err)
	}

	// Clean up staging table
	_, err = tx.Exec(`DROP TABLE work.raw_staging_table;`)
	if err != nil {
		return &result, fmt.Errorf("failed to clean up staging table: %w", err)
	}

	err = tx.Commit()
	if err != nil {
		return &result, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return &result, nil
}

