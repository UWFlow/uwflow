-- Duplicate profs: when the same person shows up under two codes (e.g.
-- josh_neufeld and josh_d_neufeld), a maintainer calls merge_prof(from, into).
-- Both prof rows are kept. The merge is recorded in the prof_merge ledger, the
-- from prof's reviews and sections move to the into prof, and search shows one
-- prof whose other names are listed as aliases.
CREATE TABLE prof_merge (
  -- A prof can be merged away at most once
  from_prof_id INT PRIMARY KEY
    REFERENCES prof(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  into_prof_id INT NOT NULL
    REFERENCES prof(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  -- Reviews moved by the merge, so it can be undone by hand
  review_ids INT[] NOT NULL,
  merged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT prof_merge_not_self CHECK (from_prof_id <> into_prof_id)
);

CREATE INDEX prof_merge_into_prof_id_fkey ON prof_merge(into_prof_id);

-- Idempotent: does nothing if from_code is already merged into into_code.
CREATE FUNCTION merge_prof(from_code TEXT, into_code TEXT)
RETURNS VOID AS $$
  DECLARE
    keep_id INT;
    drop_id INT;
    moved INT[];
  BEGIN
    from_code := LOWER(from_code);
    into_code := LOWER(into_code);

    SELECT id INTO drop_id FROM prof WHERE code = from_code;
    IF drop_id IS NULL THEN
      RAISE EXCEPTION 'merge_prof: no prof with code %', from_code;
    END IF;
    SELECT id INTO keep_id FROM prof WHERE code = into_code;
    IF keep_id IS NULL THEN
      RAISE EXCEPTION 'merge_prof: no prof with code %', into_code;
    END IF;
    IF keep_id = drop_id THEN
      RAISE EXCEPTION 'merge_prof: from and into code are both %', from_code;
    END IF;

    IF EXISTS(SELECT FROM prof_merge WHERE from_prof_id = drop_id AND into_prof_id = keep_id) THEN
      RETURN;
    END IF;
    IF EXISTS(SELECT FROM prof_merge WHERE from_prof_id = drop_id) THEN
      RAISE EXCEPTION 'merge_prof: % is already merged into another prof', from_code;
    END IF;
    IF EXISTS(SELECT FROM prof_merge WHERE from_prof_id = keep_id) THEN
      RAISE EXCEPTION 'merge_prof: % is merged into another prof, merge into that one', into_code;
    END IF;
    IF EXISTS(SELECT FROM prof_merge WHERE into_prof_id = drop_id) THEN
      RAISE EXCEPTION 'merge_prof: other profs are merged into %', from_code;
    END IF;

    -- Moving reviews between profs during a merge must not look like an edit
    ALTER TABLE review DISABLE TRIGGER set_review_updated_at;
    WITH m AS (
      UPDATE review SET prof_id = keep_id WHERE prof_id = drop_id RETURNING id
    )
    SELECT COALESCE(ARRAY_AGG(id ORDER BY id), ARRAY[]::INT[]) INTO moved FROM m;
    ALTER TABLE review ENABLE TRIGGER set_review_updated_at;

    UPDATE section_meeting SET prof_id = keep_id WHERE prof_id = drop_id;
    UPDATE prof_remap SET prof_id = keep_id WHERE prof_id = drop_id;

    INSERT INTO prof_merge(from_prof_id, into_prof_id, review_ids)
    VALUES (drop_id, keep_id, moved);

    REFRESH MATERIALIZED VIEW materialized.prof_rating;
    REFRESH MATERIALIZED VIEW materialized.prof_review_rating;
    REFRESH MATERIALIZED VIEW materialized.prof_teaches_course;
    REFRESH MATERIALIZED VIEW materialized.course_search_index;
    REFRESH MATERIALIZED VIEW materialized.prof_search_index;
  END;
$$ LANGUAGE plpgsql;

-- Recreate the search index: merged-away profs are left out, and their names
-- are searchable on, and listed as aliases of, the prof they were merged into
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
  -- names of profs merged into this one, see merge_prof
  COALESCE((SELECT ARRAY_AGG(p.name ORDER BY p.name)
    FROM prof_merge pm JOIN prof p ON p.id = pm.from_prof_id
    WHERE pm.into_prof_id = prof.id),
    ARRAY[]::TEXT[])                          AS aliases,
  to_tsvector('simple', prof.name) ||
  to_tsvector('simple', COALESCE((SELECT STRING_AGG(p.name, ' ')
    FROM prof_merge pm JOIN prof p ON p.id = pm.from_prof_id
    WHERE pm.into_prof_id = prof.id), ''))
                                              AS document
FROM prof
  LEFT JOIN materialized.prof_teaches_course ON materialized.prof_teaches_course.prof_id = prof.id
  LEFT JOIN materialized.prof_rating ON materialized.prof_rating.prof_id = prof.id
WHERE NOT EXISTS(SELECT FROM prof_merge WHERE from_prof_id = prof.id)
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
