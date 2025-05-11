-- This migration 

-- Introduces a new table materialized.prof_taught_course seeded from reviews and parsed_prof_taught_course

-- Then it replaces the materialized view materialized.prof_teaches_course
-- with a table materialized.prof_taught_course seeded from reviews and parsed_prof_taught_course

-- It also updates the course_search_index and prof_search_index materialized views
-- to use the new table.

BEGIN;

---------------------------------- ADD NEW TABLE prof_taught_course ----------------------------------

CREATE TABLE IF NOT EXISTS public.parsed_prof_taught_course(
    course_id INT NOT NULL,
    prof_id INT NOT NULL,
    CONSTRAINT prof_taught_course_course_id_fkey FOREIGN KEY (course_id)
        REFERENCES public.course(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT prof_taught_course_prof_id_fkey FOREIGN KEY (prof_id)
        REFERENCES public.prof(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT prof_taught_course_pkey PRIMARY KEY (course_id, prof_id)
);

-- Add comments to the new table and columns
COMMENT ON TABLE public.parsed_prof_taught_course IS 'Stores associations between courses and professors, initially seeded from review data.';
COMMENT ON COLUMN public.parsed_prof_taught_course.course_id IS 'Foreign key referencing the course.';
COMMENT ON COLUMN public.parsed_prof_taught_course.prof_id IS 'Foreign key referencing the professor.';



---------------------------------- REPLACE MATERIALIZED VIEWS ----------------------------------

DROP FUNCTION IF EXISTS search_courses(text, boolean);
DROP FUNCTION IF EXISTS search_profs(text, boolean);

-- The plain view that sits on top of the mat-view
DROP VIEW IF EXISTS course_search_index;
DROP VIEW IF EXISTS prof_search_index;
DROP VIEW IF EXISTS prof_teaches_course;

DROP TRIGGER IF EXISTS refresh_section_meeting ON section_meeting;
DROP TRIGGER IF EXISTS refresh_course_section ON course_section; -- If exists
DROP FUNCTION IF EXISTS refresh_section_meeting_views;

-- Finally the materialized views
DROP MATERIALIZED VIEW IF EXISTS materialized.course_search_index;
DROP MATERIALIZED VIEW IF EXISTS materialized.prof_search_index;

DROP MATERIALIZED VIEW IF EXISTS materialized.prof_teaches_course;

CREATE MATERIALIZED VIEW materialized.prof_teaches_course AS
SELECT DISTINCT r.course_id, r.prof_id
FROM public.review r
WHERE r.course_id IS NOT NULL AND r.prof_id IS NOT NULL
UNION 
SELECT DISTINCT r.course_id, r.prof_id
FROM public.parsed_prof_taught_course r
WHERE r.course_id IS NOT NULL AND r.prof_id IS NOT NULL;

CREATE INDEX prof_teaches_course_course_id_fkey ON materialized.prof_teaches_course(course_id);
CREATE INDEX prof_teaches_course_prof_id_fkey ON materialized.prof_teaches_course(prof_id);

CREATE VIEW prof_teaches_course AS
SELECT * FROM materialized.prof_teaches_course;

---------------------------------- course_search_index ----------------------------------

CREATE MATERIALIZED VIEW materialized.course_search_index AS
SELECT
  course.id                                   AS course_id,
  course.code                                 AS code,
  course.name                                 AS name,
  ARRAY_TO_STRING(REGEXP_MATCHES(
    course.code, '^(.+?)[0-9]'), '')          AS course_letters,
  materialized.course_rating.filled_count     AS ratings,
  materialized.course_rating.liked            AS liked,
  materialized.course_rating.easy             AS easy,
  materialized.course_rating.useful           AS useful,
  COALESCE(ARRAY_AGG(DISTINCT course_section.term_id)
    FILTER (WHERE course_section.term_id IS NOT NULL),
    ARRAY[]::INT[])                           AS terms,
  -- New field that identifies terms with available seats
  COALESCE(ARRAY_AGG(DISTINCT course_section.term_id)
    FILTER (WHERE course_section.term_id IS NOT NULL 
            AND course_section.enrollment_total < course_section.enrollment_capacity),
    ARRAY[]::INT[])                           AS terms_with_seats,
  COALESCE(ARRAY_AGG(DISTINCT materialized.prof_teaches_course.prof_id)
    FILTER (WHERE materialized.prof_teaches_course.prof_id IS NOT NULL),
    ARRAY[]::INT[])                           AS prof_ids,
  -- check if prereqs are either empty or null
  COALESCE(TRIM(course.prereqs), '') != '' OR
    COALESCE(ARRAY_LENGTH(ARRAY_AGG(
      DISTINCT course_prerequisite.course_id)
      FILTER (WHERE course_prerequisite.course_id IS NOT NULL),
    1), 0) > 0                                AS has_prereqs,
  to_tsvector('simple', course.code) ||
  to_tsvector('simple', course.name) ||
  -- index course numbers to support queries where the course code is split
  -- ie) the query "ECE 105" should match both "ECE" and "105" because
  -- the frontend will translate the raw query to "ECE:* & 105:*"
  to_tsvector('simple', ARRAY_TO_STRING(REGEXP_MATCHES(course.code,
    '^[a-z|A-Z]+([0-9]+[a-z|A-Z]*)'), ''))    AS document
FROM course
  LEFT JOIN course_prerequisite ON course_prerequisite.course_id = course.id
  LEFT JOIN course_section ON course_section.course_id = course.id
  LEFT JOIN materialized.prof_teaches_course ON materialized.prof_teaches_course.course_id = course.id
  LEFT JOIN materialized.course_rating ON materialized.course_rating.course_id = course.id
GROUP BY course.id, ratings, liked, easy, useful;

CREATE VIEW course_search_index AS
SELECT * FROM materialized.course_search_index;

CREATE INDEX idx_course_search ON materialized.course_search_index USING GIN(document);

---------------------------------- prof_search_index ----------------------------------

CREATE MATERIALIZED VIEW materialized.prof_search_index AS
SELECT
  prof.id                                     AS prof_id,
  prof.name                                   AS name,
  prof.code                                   AS code,
  materialized.prof_rating.filled_count       AS ratings,
  materialized.prof_rating.liked              AS liked,
  materialized.prof_rating.clear              AS clear,
  materialized.prof_rating.engaging           AS engaging,
  COALESCE(ARRAY_AGG(DISTINCT materialized.prof_teaches_course.course_id)
    FILTER (WHERE materialized.prof_teaches_course.course_id IS NOT NULL),
    ARRAY[]::INT[])                           AS course_ids,
  COALESCE(ARRAY(SELECT course.code FROM
    unnest(ARRAY_AGG(DISTINCT materialized.prof_teaches_course.course_id)
    FILTER (WHERE materialized.prof_teaches_course.course_id IS NOT NULL)) course_id
    LEFT JOIN course on course.id = course_id),
    ARRAY[]::TEXT[])                          AS course_codes,
  to_tsvector('simple', prof.name)            AS document
FROM prof
  LEFT JOIN materialized.prof_teaches_course ON materialized.prof_teaches_course.prof_id = prof.id
  LEFT JOIN materialized.prof_rating ON materialized.prof_rating.prof_id = prof.id
GROUP BY prof.id, ratings, liked, clear, engaging;

CREATE VIEW prof_search_index AS
SELECT * FROM materialized.prof_search_index;

CREATE INDEX idx_prof_search ON materialized.prof_search_index USING GIN(document);


---------------------------------- search_profs, search_courses ----------------------------------

CREATE FUNCTION search_profs(query TEXT, code_only BOOLEAN)
RETURNS SETOF prof_search_index AS $$
  BEGIN
    IF code_only THEN
      RETURN QUERY
      SELECT DISTINCT * FROM (SELECT unnest(prof_ids) AS prof_id
        FROM course_search_index
        WHERE course_letters ILIKE query) course_profs
        LEFT JOIN prof_search_index USING (prof_id)
      ORDER BY ratings DESC;
    ELSE
      RETURN QUERY
      SELECT * FROM prof_search_index
        WHERE document @@ to_tsquery('simple', query)
      UNION
      SELECT DISTINCT * FROM (SELECT unnest(prof_ids) AS prof_id
        FROM course_search_index
        WHERE document @@ to_tsquery('simple', query)) course_profs
        LEFT JOIN prof_search_index USING (prof_id)
      ORDER BY ratings DESC;
    END IF;
  END;
$$ LANGUAGE plpgsql STABLE;

CREATE FUNCTION search_courses(query TEXT, code_only BOOLEAN)
RETURNS SETOF course_search_index AS $$
  BEGIN
    IF code_only THEN
      RETURN QUERY
      SELECT * FROM course_search_index
        WHERE course_letters ILIKE query
      ORDER BY ratings DESC;
    ELSE
      RETURN QUERY
      SELECT * FROM course_search_index
        WHERE document @@ to_tsquery('simple', query)
      UNION
      SELECT DISTINCT * FROM (SELECT unnest(course_ids) AS course_id
        FROM public.prof_search_index
        WHERE document @@ to_tsquery('simple', query)) prof_courses
        LEFT JOIN course_search_index USING (course_id)
      ORDER BY ratings DESC;
    END IF;
  END
$$ LANGUAGE plpgsql STABLE;



---------------------------------- section_meeting TRIGGER ----------------------------------


-- Remove this materialized view from the section views

CREATE FUNCTION refresh_section_meeting_views()
RETURNS TRIGGER AS $$
  BEGIN
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.course_rating;';
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.prof_rating;';
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.course_search_index;';
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.prof_search_index;';
    RETURN NULL;
  END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_section_meeting
AFTER INSERT OR UPDATE OR DELETE ON section_meeting
FOR EACH STATEMENT
EXECUTE PROCEDURE refresh_section_meeting_views();
