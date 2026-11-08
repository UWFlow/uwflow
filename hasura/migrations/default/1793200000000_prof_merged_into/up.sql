-- A merged prof keeps its row, so its name and code stay searchable and
-- linkable, and points at the prof it forwards to.
ALTER TABLE prof
  ADD COLUMN merged_into INT REFERENCES prof(id) ON UPDATE CASCADE,
  ADD CONSTRAINT prof_not_merged_into_self CHECK (merged_into <> id);

CREATE INDEX prof_merged_into_fkey ON prof(merged_into);

UPDATE prof p SET merged_into = r.prof_id
FROM prof_remap r WHERE p.code = r.code AND p.id <> r.prof_id;

-- Importer remaps never had a row of their own
INSERT INTO prof(name, code, merged_into)
SELECT INITCAP(REPLACE(r.code, '_', ' ')), r.code, r.prof_id
FROM prof_remap r
WHERE NOT EXISTS(SELECT FROM prof p WHERE p.code = r.code);

-- Anything attached since the merge belongs to the kept prof
ALTER TABLE review DISABLE TRIGGER set_review_updated_at;
UPDATE review r SET prof_id = p.merged_into
FROM prof p WHERE r.prof_id = p.id AND p.merged_into IS NOT NULL;
ALTER TABLE review ENABLE TRIGGER set_review_updated_at;

UPDATE section_meeting s SET prof_id = p.merged_into
FROM prof p WHERE s.prof_id = p.id AND p.merged_into IS NOT NULL;

REFRESH MATERIALIZED VIEW materialized.prof_rating;
REFRESH MATERIALIZED VIEW materialized.prof_review_rating;
REFRESH MATERIALIZED VIEW materialized.prof_teaches_course;

DROP FUNCTION merge_prof;

-- Points the from prof at the into prof and moves its reviews and sections.
-- Merged profs always point at a prof that is not merged. Idempotent.
CREATE FUNCTION merge_prof(from_code TEXT, into_code TEXT)
RETURNS VOID AS $$
  DECLARE
    drop_id INT;
    drop_target INT;
    keep_id INT;
    keep_target INT;
  BEGIN
    SELECT id, merged_into INTO drop_id, drop_target FROM prof WHERE code = from_code;
    SELECT id, merged_into INTO keep_id, keep_target FROM prof WHERE code = into_code;

    IF drop_id IS NULL OR keep_id IS NULL OR drop_id = keep_id THEN
      RAISE EXCEPTION 'merge_prof: cannot merge % into %', from_code, into_code;
    END IF;
    IF drop_target IN (keep_id, keep_target) THEN
      RETURN;
    END IF;
    IF drop_target IS NOT NULL OR keep_target IS NOT NULL THEN
      RAISE EXCEPTION 'merge_prof: % or % is already merged', from_code, into_code;
    END IF;

    -- Moving reviews must not look like an edit
    ALTER TABLE review DISABLE TRIGGER set_review_updated_at;
    UPDATE review SET prof_id = keep_id WHERE prof_id = drop_id;
    ALTER TABLE review ENABLE TRIGGER set_review_updated_at;

    UPDATE section_meeting SET prof_id = keep_id WHERE prof_id = drop_id;
    UPDATE prof SET merged_into = keep_id WHERE merged_into = drop_id OR id = drop_id;

    REFRESH MATERIALIZED VIEW materialized.prof_rating;
    REFRESH MATERIALIZED VIEW materialized.prof_review_rating;
    REFRESH MATERIALIZED VIEW materialized.prof_teaches_course;
    REFRESH MATERIALIZED VIEW materialized.course_search_index;
    REFRESH MATERIALIZED VIEW materialized.prof_search_index;
  END;
$$ LANGUAGE plpgsql;

-- Recreate the search index from merged rows instead of prof_alias
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
  ARRAY(SELECT m.name FROM prof m WHERE m.merged_into = prof.id ORDER BY m.name) AS aliases,
  to_tsvector('simple', prof.name || ' ' || COALESCE((SELECT STRING_AGG(m.name, ' ')
    FROM prof m WHERE m.merged_into = prof.id), '')) AS document
FROM prof
  LEFT JOIN materialized.prof_teaches_course ON materialized.prof_teaches_course.prof_id = prof.id
  LEFT JOIN materialized.prof_rating ON materialized.prof_rating.prof_id = prof.id
WHERE prof.merged_into IS NULL
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

DROP TABLE prof_merge;
DROP TABLE prof_alias;
DROP TABLE prof_remap;
