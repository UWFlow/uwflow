-- Goal: surface scraped (Quest) prof->course associations in search by
--   (1) adding the scraped_prof_teaches_course table, and
--   (2) folding it into the prof_teaches_course materialized view via UNION.
--
-- prof_teaches_course can't be redefined in place: course_search_index,
-- prof_search_index, search_courses, and search_profs all depend on it. So we
-- drop that whole dependent chain, redefine prof_teaches_course, then recreate
-- the dependents VERBATIM. Only the three blocks marked CHANGED below are new;
-- everything marked UNCHANGED is an identical rebuild of the current schema.

-- Tear down the dependent chain (recreated unchanged near the bottom).
DROP TRIGGER refresh_section_meeting ON section_meeting;
DROP TRIGGER IF EXISTS refresh_course_section ON course_section;

DROP FUNCTION refresh_section_meeting_views;
DROP FUNCTION search_courses;
DROP FUNCTION search_profs;

DROP VIEW course_search_index;
DROP MATERIALIZED VIEW materialized.course_search_index;
DROP VIEW prof_search_index;
DROP MATERIALIZED VIEW materialized.prof_search_index;
DROP VIEW prof_teaches_course;
DROP MATERIALIZED VIEW materialized.prof_teaches_course;

-- === CHANGED: new table holding scraped associations ===
CREATE TABLE scraped_prof_teaches_course (
  course_id INT NOT NULL
    REFERENCES course(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  prof_id INT NOT NULL
    REFERENCES prof(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  term_id INT NOT NULL,
  source TEXT NOT NULL DEFAULT 'quest_scraper'
    CONSTRAINT scraped_prof_teaches_course_source_length CHECK (LENGTH(source) <= 64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT scraped_prof_teaches_course_unique UNIQUE(course_id, prof_id, term_id, source)
);

-- course_id is already covered by the leading column of the UNIQUE index above.
CREATE INDEX scraped_prof_teaches_course_prof_id_fkey
  ON scraped_prof_teaches_course(prof_id);

-- === CHANGED: was section_meeting only; now UNIONs in the scraped table ===
CREATE MATERIALIZED VIEW materialized.prof_teaches_course AS
SELECT DISTINCT course_id, prof_id
FROM (
  SELECT cs.course_id, sm.prof_id
  FROM course_section cs
    JOIN section_meeting sm ON sm.section_id = cs.id
  WHERE sm.prof_id IS NOT NULL

  UNION

  SELECT course_id, prof_id
  FROM scraped_prof_teaches_course
) teaching;

CREATE VIEW prof_teaches_course AS
SELECT * FROM materialized.prof_teaches_course;

-- === UNCHANGED below: dependents recreated verbatim from the current schema ===
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
  COALESCE(ARRAY_AGG(DISTINCT course_section.term_id)
    FILTER (WHERE course_section.term_id IS NOT NULL
            AND course_section.enrollment_total < course_section.enrollment_capacity),
    ARRAY[]::INT[])                           AS terms_with_seats,
  COALESCE(ARRAY_AGG(DISTINCT materialized.prof_teaches_course.prof_id)
    FILTER (WHERE materialized.prof_teaches_course.prof_id IS NOT NULL),
    ARRAY[]::INT[])                           AS prof_ids,
  COALESCE(ARRAY_AGG(DISTINCT course_section.term_id)
    FILTER (WHERE course_section.is_online = TRUE),
    ARRAY[]::INT[])                           AS terms_with_online_sections,
  COALESCE(TRIM(course.prereqs), '') != '' OR
    COALESCE(ARRAY_LENGTH(ARRAY_AGG(
      DISTINCT course_prerequisite.course_id)
      FILTER (WHERE course_prerequisite.course_id IS NOT NULL),
    1), 0) > 0                                AS has_prereqs,
  to_tsvector('simple', course.code) ||
  to_tsvector('simple', course.name) ||
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

CREATE INDEX prof_teaches_course_course_id_fkey
  ON materialized.prof_teaches_course(course_id);
CREATE INDEX prof_teaches_course_prof_id_fkey
  ON materialized.prof_teaches_course(prof_id);
CREATE INDEX idx_course_search
  ON materialized.course_search_index USING GIN(document);
CREATE INDEX idx_prof_search
  ON materialized.prof_search_index USING GIN(document);

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

CREATE TRIGGER refresh_course_section
AFTER INSERT OR UPDATE OR DELETE ON course_section
FOR EACH STATEMENT
EXECUTE PROCEDURE refresh_section_meeting_views();

-- === CHANGED: refresh the views when scraped rows change ===
CREATE TRIGGER refresh_scraped_prof_teaches_course
AFTER INSERT OR UPDATE OR DELETE ON scraped_prof_teaches_course
FOR EACH STATEMENT
EXECUTE PROCEDURE refresh_section_meeting_views();
