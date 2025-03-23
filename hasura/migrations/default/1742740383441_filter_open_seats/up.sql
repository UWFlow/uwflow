-- This migration adds the terms_with_room column to the course_search_index views
-- and then recreates all dependent functions and indexes

-- DROP RELATED VIEWS AND FUNCTIONS
DROP TRIGGER refresh_section_meeting ON section_meeting;

DROP FUNCTION refresh_section_meeting_views;
DROP FUNCTION search_courses;
DROP FUNCTION search_profs;

DROP VIEW course_search_index;
DROP MATERIALIZED VIEW materialized.course_search_index;

-- RECREATE NEW MATERIALIZED VIEW AND FUNCTIONS (with both has_prereqs and terms_with_room)
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

CREATE FUNCTION refresh_section_meeting_views()
RETURNS TRIGGER AS $$
  BEGIN
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.course_rating;';
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.prof_rating;';
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.prof_teaches_course;';
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.course_search_index;';
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.prof_search_index;';
    RETURN NULL;
  END;
$$ LANGUAGE plpgsql;

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
        FROM prof_search_index
        WHERE document @@ to_tsquery('simple', query)) prof_courses
        LEFT JOIN course_search_index USING (course_id)
      ORDER BY ratings DESC;
    END IF;
  END
$$ LANGUAGE plpgsql STABLE;

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

CREATE TRIGGER refresh_section_meeting
AFTER INSERT OR UPDATE OR DELETE ON section_meeting
FOR EACH STATEMENT
EXECUTE PROCEDURE refresh_section_meeting_views();
