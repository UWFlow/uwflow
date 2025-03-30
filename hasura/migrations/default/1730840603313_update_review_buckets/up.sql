-- This migration updates the review buckets to only include reviews with a non-NULL liked

-- Comment originally from migrations/default/1559740220527_init/up.sql:
-- We only consider reviews with non-NULL liked as filled.
-- This is because it's impossible to submit anything else with NULL liked,
-- but it *is* possible to have all fields be NULL by liking then unliking.

-- First drop triggers if they exist
DROP TRIGGER IF EXISTS refresh_course_easy_buckets ON review;

-- Then drop functions
DROP FUNCTION IF EXISTS refresh_review_buckets() CASCADE;

-- Then drop views with IF EXISTS
DROP VIEW IF EXISTS aggregate.course_easy_buckets CASCADE;
DROP VIEW IF EXISTS aggregate.course_useful_buckets CASCADE;
DROP VIEW IF EXISTS aggregate.prof_clear_buckets CASCADE;
DROP VIEW IF EXISTS aggregate.prof_engaging_buckets CASCADE;

-- Then drop materialized views with IF EXISTS
DROP MATERIALIZED VIEW IF EXISTS materialized.course_easy_buckets CASCADE;
DROP MATERIALIZED VIEW IF EXISTS materialized.course_useful_buckets CASCADE;
DROP MATERIALIZED VIEW IF EXISTS materialized.prof_clear_buckets CASCADE;
DROP MATERIALIZED VIEW IF EXISTS materialized.prof_engaging_buckets CASCADE;

CREATE MATERIALIZED VIEW materialized.course_easy_buckets AS
SELECT 
  course_id, 
  course_easy AS value, 
  COUNT(*) AS count
FROM review 
WHERE course_easy IS NOT NULL AND liked is NOT NULL AND (course_comment IS NOT NULL OR prof_comment IS NOT NULL)
GROUP BY course_id, course_easy
ORDER BY value DESC;

CREATE MATERIALIZED VIEW materialized.course_useful_buckets AS
SELECT 
  course_id, 
  course_useful AS value, 
  COUNT(*) AS count
FROM review 
WHERE course_useful IS NOT NULL AND liked is NOT NULL AND (course_comment IS NOT NULL OR prof_comment IS NOT NULL)
GROUP BY course_id, course_useful
ORDER BY value DESC;

CREATE MATERIALIZED VIEW materialized.prof_clear_buckets AS
SELECT 
  prof_id, 
  prof_clear AS value, 
  COUNT(*) AS count
FROM review 
WHERE prof_clear IS NOT NULL AND liked is NOT NULL AND (course_comment IS NOT NULL OR prof_comment IS NOT NULL)
GROUP BY prof_id, prof_clear
ORDER BY value DESC;

CREATE MATERIALIZED VIEW materialized.prof_engaging_buckets AS
SELECT 
  prof_id, 
  prof_engaging AS value, 
  COUNT(*) AS count
FROM review 
WHERE prof_engaging IS NOT NULL AND liked is NOT NULL AND (course_comment IS NOT NULL OR prof_comment IS NOT NULL)
GROUP BY prof_id, prof_engaging
ORDER BY value DESC;

-- END MATERIALIZED VIEWS

-- START MATERIALIZED INDEXES

CREATE INDEX course_easy_buckets_course_id_fkey ON materialized.course_easy_buckets(course_id);
CREATE INDEX course_useful_buckets_course_id_fkey ON materialized.course_useful_buckets(course_id);
CREATE INDEX prof_clear_buckets_prof_id_fkey ON materialized.prof_clear_buckets(prof_id);
CREATE INDEX prof_engaging_buckets_prof_id_fkey ON materialized.prof_engaging_buckets(prof_id);

-- END MATERIALIZED INDEXES

-- START MATERIALIZED FUNCTIONS
CREATE FUNCTION refresh_review_buckets()
RETURNS TRIGGER AS $$
  BEGIN
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.course_easy_buckets;';
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.course_useful_buckets;';
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.prof_clear_buckets;';
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.prof_engaging_buckets;';
    RETURN NULL;
  END;
$$ LANGUAGE plpgsql;

-- END MATERIALIZED FUNCTIONS

-- START MATERIALIZED TRIGGERS

CREATE TRIGGER refresh_course_easy_buckets
AFTER INSERT OR UPDATE OR DELETE ON review
FOR EACH STATEMENT
EXECUTE PROCEDURE refresh_review_buckets();

-- END MATERIALIZED TRIGGERS

CREATE VIEW aggregate.course_easy_buckets AS 
SELECT * FROM materialized.course_easy_buckets;

CREATE VIEW aggregate.course_useful_buckets AS 
SELECT * FROM materialized.course_useful_buckets;

CREATE VIEW aggregate.prof_clear_buckets AS 
SELECT * FROM materialized.prof_clear_buckets;

CREATE VIEW aggregate.prof_engaging_buckets AS 
SELECT * FROM materialized.prof_engaging_buckets;

-- END VIEWS
