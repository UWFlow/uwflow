-- Names a prof is also known as. Search matches them and prof pages list them.
-- Filled by rename_prof and merge_prof.
CREATE TABLE prof_alias (
  prof_id INT NOT NULL
    REFERENCES prof(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  name TEXT NOT NULL
    CONSTRAINT prof_alias_name_length CHECK (LENGTH(name) <= 256),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (prof_id, name)
);

-- A prof whose name changed (e.g. Karen Yeats -> Rowan "Ren" Yeats) keeps its
-- row and code; the former name becomes an alias.
-- Idempotent, and works if the name was already changed by hand.
CREATE FUNCTION rename_prof(prof_code TEXT, former_name TEXT, new_name TEXT)
RETURNS VOID AS $$
  DECLARE
    keep_id INT;
  BEGIN
    SELECT id INTO keep_id FROM prof WHERE code = LOWER(prof_code);
    IF keep_id IS NULL THEN
      RAISE EXCEPTION 'rename_prof: no prof with code %', prof_code;
    END IF;

    UPDATE prof SET name = new_name WHERE id = keep_id AND name <> new_name;
    DELETE FROM prof_alias WHERE prof_id = keep_id AND name = new_name;
    INSERT INTO prof_alias(prof_id, name) VALUES (keep_id, former_name)
    ON CONFLICT DO NOTHING;

    REFRESH MATERIALIZED VIEW materialized.prof_search_index;
  END;
$$ LANGUAGE plpgsql;

-- Duplicate profs: when the same person shows up under two codes (e.g.
-- josh_neufeld and josh_d_neufeld), a maintainer calls merge_prof(from, into).
-- Both prof rows are kept. The merge is recorded in the prof_merge ledger, the
-- from prof's reviews and sections move to the into prof, and its names become
-- aliases of the into prof.
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

    INSERT INTO prof_alias(prof_id, name)
    SELECT keep_id, name FROM prof WHERE id = drop_id
    UNION
    SELECT keep_id, name FROM prof_alias WHERE prof_id = drop_id
    EXCEPT
    SELECT keep_id, name FROM prof WHERE id = keep_id
    ON CONFLICT DO NOTHING;

    REFRESH MATERIALIZED VIEW materialized.prof_rating;
    REFRESH MATERIALIZED VIEW materialized.prof_review_rating;
    REFRESH MATERIALIZED VIEW materialized.prof_teaches_course;
    REFRESH MATERIALIZED VIEW materialized.course_search_index;
    REFRESH MATERIALIZED VIEW materialized.prof_search_index;
  END;
$$ LANGUAGE plpgsql;

-- Recreate the search index: merged-away profs are left out, and aliases are
-- searchable and listed
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
  COALESCE((SELECT ARRAY_AGG(pa.name ORDER BY pa.name)
    FROM prof_alias pa WHERE pa.prof_id = prof.id),
    ARRAY[]::TEXT[])                          AS aliases,
  to_tsvector('simple', prof.name) ||
  to_tsvector('simple', COALESCE((SELECT STRING_AGG(pa.name, ' ')
    FROM prof_alias pa WHERE pa.prof_id = prof.id), ''))
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
