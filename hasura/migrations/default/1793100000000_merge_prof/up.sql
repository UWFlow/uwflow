-- Other names a prof goes by. Search lists each as its own entry.
CREATE TABLE prof_alias (
  prof_id INT NOT NULL REFERENCES prof(id) ON UPDATE CASCADE ON DELETE CASCADE,
  name TEXT NOT NULL,
  PRIMARY KEY (prof_id, name)
);

-- Ledger of duplicate profs merged by merge_prof. Both prof rows are kept.
CREATE TABLE prof_merge (
  from_prof_id INT PRIMARY KEY REFERENCES prof(id) ON UPDATE CASCADE,
  into_prof_id INT NOT NULL REFERENCES prof(id) ON UPDATE CASCADE,
  -- reviews moved by the merge, so it can be undone
  review_ids INT[] NOT NULL,
  merged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (from_prof_id <> into_prof_id)
);

CREATE FUNCTION add_prof_alias(prof_code TEXT, alias TEXT)
RETURNS VOID AS $$
  INSERT INTO prof_alias(prof_id, name)
  SELECT id, alias FROM prof WHERE code = prof_code AND name <> alias
  ON CONFLICT DO NOTHING;
  REFRESH MATERIALIZED VIEW materialized.prof_search_index;
$$ LANGUAGE sql;

-- Moves the from prof's reviews and sections to the into prof and makes its
-- name an alias. The importer maps its code through prof_remap. Idempotent.
CREATE FUNCTION merge_prof(from_code TEXT, into_code TEXT)
RETURNS VOID AS $$
  DECLARE
    drop_id INT := (SELECT id FROM prof WHERE code = from_code);
    keep_id INT := (SELECT id FROM prof WHERE code = into_code);
    moved INT[];
  BEGIN
    IF EXISTS(SELECT FROM prof_merge WHERE from_prof_id = drop_id AND into_prof_id = keep_id) THEN
      RETURN;
    END IF;

    -- Moving reviews must not look like an edit
    ALTER TABLE review DISABLE TRIGGER set_review_updated_at;
    WITH m AS (UPDATE review SET prof_id = keep_id WHERE prof_id = drop_id RETURNING id)
    SELECT COALESCE(ARRAY_AGG(id), '{}') INTO moved FROM m;
    ALTER TABLE review ENABLE TRIGGER set_review_updated_at;

    UPDATE section_meeting SET prof_id = keep_id WHERE prof_id = drop_id;
    INSERT INTO prof_merge VALUES (drop_id, keep_id, moved);
    INSERT INTO prof_remap VALUES (from_code, keep_id) ON CONFLICT (code) DO UPDATE SET prof_id = keep_id;

    REFRESH MATERIALIZED VIEW materialized.prof_rating;
    REFRESH MATERIALIZED VIEW materialized.prof_review_rating;
    REFRESH MATERIALIZED VIEW materialized.prof_teaches_course;
    REFRESH MATERIALIZED VIEW materialized.course_search_index;
    PERFORM add_prof_alias(into_code, (SELECT name FROM prof WHERE id = drop_id));
  END;
$$ LANGUAGE plpgsql;

-- Recreate the search index with aliases and without merged-away profs
DROP FUNCTION search_courses;
DROP FUNCTION search_profs;
DROP VIEW prof_search_index;
DROP MATERIALIZED VIEW materialized.prof_search_index;

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
  ARRAY(SELECT name FROM prof_alias WHERE prof_id = prof.id) AS aliases,
  to_tsvector('simple', prof.name || ' ' || COALESCE((SELECT STRING_AGG(name, ' ')
    FROM prof_alias WHERE prof_id = prof.id), '')) AS document
FROM prof
  LEFT JOIN materialized.prof_teaches_course ON materialized.prof_teaches_course.prof_id = prof.id
  LEFT JOIN materialized.prof_rating ON materialized.prof_rating.prof_id = prof.id
WHERE prof.id NOT IN (SELECT from_prof_id FROM prof_merge)
GROUP BY prof.id, ratings, liked, clear, engaging;

CREATE INDEX idx_prof_search ON materialized.prof_search_index USING GIN(document);

CREATE VIEW prof_search_index AS
SELECT * FROM materialized.prof_search_index;

CREATE FUNCTION search_courses(query TEXT, code_only BOOLEAN)
RETURNS SETOF course_search_index AS $$
  BEGIN
    IF code_only THEN
      RETURN QUERY
      SELECT * FROM course_search_index
        WHERE course_letters ILIKE query
          OR EXISTS(SELECT FROM unnest(aliases) a
            WHERE REGEXP_REPLACE(a, '[0-9].*$', '') ILIKE query)
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
