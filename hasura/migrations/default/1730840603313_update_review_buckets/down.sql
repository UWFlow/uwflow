-- Update AGGREGATE BUCKET VIEWS to only include reviews with a rating
-- and that contain either a professor or course rating, 

-- DROP RELATED VIEWS AND FUNCTIONS
DROP VIEW aggregate.course_easy_buckets;
DROP VIEW aggregate.course_useful_buckets;
DROP VIEW aggregate.prof_clear_buckets;
DROP VIEW aggregate.prof_engaging_buckets;

-- Then drop the materialized views
DROP MATERIALIZED VIEW materialized.course_easy_buckets;
DROP MATERIALIZED VIEW materialized.course_useful_buckets;
DROP MATERIALIZED VIEW materialized.prof_clear_buckets;
DROP MATERIALIZED VIEW materialized.prof_engaging_buckets;

CREATE VIEW aggregate.course_easy_buckets AS
SELECT course_id, course_easy AS value, COUNT(*) AS count
FROM review GROUP BY course_id, course_easy;

CREATE VIEW aggregate.course_useful_buckets AS
SELECT course_id, course_useful AS value, COUNT(*) AS count
FROM review GROUP BY course_id, course_useful;

CREATE VIEW aggregate.prof_clear_buckets AS
SELECT prof_id, prof_clear AS value, COUNT(*) AS count
FROM review GROUP BY prof_id, prof_clear;

CREATE VIEW aggregate.prof_engaging_buckets AS
SELECT prof_id, prof_engaging AS value, COUNT(*) AS count
FROM review GROUP BY prof_id, prof_engaging;









