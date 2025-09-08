
-- Define in Hasura Migration 
CREATE TABLE work.raw_staging_table (
  prof_name TEXT NOT NULL,
  course_id INT NOT NULL,
  CONSTRAINT raw_staging_table_pkey PRIMARY KEY (prof_id, course_id)
);

-- Get Course Code
WITH dataWithCourseCode AS (
    SELECT 
        raw_data.prof_name,
        raw_data.course_id,
        c.code AS course_code
    FROM
        work.raw_staging_table raw_data
    JOIN course c ON raw_data.course_id = c.id
)

-- Ranked Similarities 
-- Get the best matched prof for each raw_data prof
WITH RankedSimilarities AS (
    SELECT
        raw_data.prof_name,
        raw_data.course_id,
        raw_data.course_code,
        best_match_query.id AS best_matched_prof_id,
        best_match_query.name AS best_matched_prof_name,
        best_match_query.similarity_score
    FROM

    -- For each row from raw_data, the fuzzy match subquery is executed for each scraped prof nam   e
    dataWithCourseCode raw_data
    CROSS JOIN LATERAL (
        SELECT id, name
        FROM prof
        ORDER BY similarity(name, raw_data.prof_name) DESC
        LIMIT 1
    ) AS best_match_query;
),

-- Subject Matches 
-- Check if the best matched prof has taught the same subject as the raw_data prof
WITH SubjectMatches AS (
    SELECT
        rd.prof_name, 
        rd.course_id,
        rd.best_matched_prof_id,
        rd.best_matched_prof_name,
        rd.similarity_score,
        CASE 
            WHEN substring(c.coure_code FROM '^[[:alpha:]]+') IN (
                SELECT c.code
                FROM prof_teaches_course ptc
                JOIN course c ON c.id = ptc.course_id
                WHERE ptc.prof_id = p.id
                ORDER BY c.code
            ) THEN TRUE ELSE FALSE
        END AS subject_match
    FROM
        RankedSimilarities rd 
)

-- Categorize Matches 

-- From 1745912089107_rebuild_prof_teaches_course migration: 

-- CREATE TYPE work.prof_teaches_course_category AS ENUM ('INSERT_AND_ADD_PROF', 'INSERT', 'AMBIGUOUS', 'IGNORE');

-- CREATE TABLE work.prof_teaches_course_delta(
--   prof_id INT NOT NULL,
--   course_id INT NOT NULL,
--   category work.prof_teaches_course_category NOT NULL,
--   similarity FLOAT DEFAULT NULL,

--   CONSTRAINT prof_teaches_course_delta_pkey PRIMARY KEY (prof_id, course_id)
-- );

INSERT INTO work.prof_teaches_course_delta (prof_id, course_id, category, similarity_score)
SELECT
    sm.best_matched_prof_id,
    sm.course_id,
    CASE 
        WHEN sm.similarity_score == 1.0 THEN 'INSERT'
        WHEN sm.similarity_score > 0.6 AND sm.subject_match THEN 'INSERT'
        WHEN sm.similarity_score > 0.6 AND NOT sm.subject_match THEN 'AMBIGUOUS'
        WHEN sm.similarity_score <= 0.6 AND sm.subject_match THEN 'AMBIGUOUS'
        WHEN sm.similarity_score <= 0.6 AND NOT sm.subject_match THEN 'INSERT_AND_ADD_PROF'
        ELSE 'IGNORE'
    END AS category,
    sm.similarity_score
FROM
    SubjectMatches sm
