-- A merged prof's code lives on as an alias, as a renamed course's code does.
-- The merged row is deleted; prof_merge keeps what is needed to undo the merge.
ALTER TABLE prof_alias ADD COLUMN code TEXT UNIQUE;

ALTER TABLE prof_merge
  ADD COLUMN from_code TEXT,
  ADD COLUMN from_name TEXT;

UPDATE prof_merge m SET from_code = p.code, from_name = p.name
FROM prof p WHERE p.id = m.from_prof_id;

ALTER TABLE prof_merge
  ALTER COLUMN from_code SET NOT NULL,
  ALTER COLUMN from_name SET NOT NULL,
  ADD UNIQUE (from_code),
  DROP CONSTRAINT prof_merge_from_prof_id_fkey;

INSERT INTO prof_alias(prof_id, name, code)
SELECT into_prof_id, from_name, from_code FROM prof_merge
ON CONFLICT (prof_id, name) DO UPDATE SET code = EXCLUDED.code;

-- Anything attached since the merge must survive the delete
ALTER TABLE review DISABLE TRIGGER set_review_updated_at;
UPDATE review r SET prof_id = m.into_prof_id
FROM prof_merge m WHERE r.prof_id = m.from_prof_id;
ALTER TABLE review ENABLE TRIGGER set_review_updated_at;

UPDATE section_meeting s SET prof_id = m.into_prof_id
FROM prof_merge m WHERE s.prof_id = m.from_prof_id;

DELETE FROM prof WHERE id IN (SELECT from_prof_id FROM prof_merge);

-- Moves the from prof onto the into prof, deletes it and keeps its name and
-- code as an alias. The importer maps its code through prof_remap. Idempotent.
CREATE OR REPLACE FUNCTION merge_prof(from_code TEXT, into_code TEXT)
RETURNS VOID AS $$
  DECLARE
    drop_id INT := (SELECT id FROM prof WHERE code = $1);
    drop_name TEXT := (SELECT name FROM prof WHERE code = $1);
    keep_id INT := (SELECT id FROM prof WHERE code = $2);
    moved INT[];
  BEGIN
    IF EXISTS(SELECT FROM prof_merge m WHERE m.from_code = $1 AND m.into_prof_id = keep_id) THEN
      RETURN;
    END IF;
    IF drop_id IS NULL OR keep_id IS NULL OR drop_id = keep_id THEN
      RAISE EXCEPTION 'merge_prof: cannot merge % into %', $1, $2;
    END IF;

    -- Moving reviews must not look like an edit
    ALTER TABLE review DISABLE TRIGGER set_review_updated_at;
    WITH m AS (UPDATE review SET prof_id = keep_id WHERE prof_id = drop_id RETURNING id)
    SELECT COALESCE(ARRAY_AGG(id), '{}') INTO moved FROM m;
    ALTER TABLE review ENABLE TRIGGER set_review_updated_at;

    UPDATE section_meeting SET prof_id = keep_id WHERE prof_id = drop_id;

    -- Earlier merges into this prof follow it, since deleting it cascades
    UPDATE prof_merge SET into_prof_id = keep_id WHERE into_prof_id = drop_id;
    UPDATE prof_remap SET prof_id = keep_id WHERE prof_id = drop_id;
    DELETE FROM prof_alias d USING prof_alias k
    WHERE d.prof_id = drop_id AND k.prof_id = keep_id AND d.name = k.name AND d.code IS NULL;
    DELETE FROM prof_alias k USING prof_alias d
    WHERE k.prof_id = keep_id AND d.prof_id = drop_id AND k.name = d.name;
    UPDATE prof_alias SET prof_id = keep_id WHERE prof_id = drop_id;

    INSERT INTO prof_merge(from_prof_id, into_prof_id, review_ids, from_code, from_name)
    VALUES (drop_id, keep_id, moved, $1, drop_name);
    INSERT INTO prof_remap VALUES ($1, keep_id) ON CONFLICT (code) DO UPDATE SET prof_id = keep_id;
    INSERT INTO prof_alias(prof_id, name, code) VALUES (keep_id, drop_name, $1)
    ON CONFLICT (prof_id, name) DO UPDATE SET code = EXCLUDED.code;

    DELETE FROM prof WHERE id = drop_id;

    REFRESH MATERIALIZED VIEW materialized.prof_rating;
    REFRESH MATERIALIZED VIEW materialized.prof_review_rating;
    REFRESH MATERIALIZED VIEW materialized.prof_teaches_course;
    REFRESH MATERIALIZED VIEW materialized.course_search_index;
    REFRESH MATERIALIZED VIEW materialized.prof_search_index;
  END;
$$ LANGUAGE plpgsql;

REFRESH MATERIALIZED VIEW materialized.prof_rating;
REFRESH MATERIALIZED VIEW materialized.prof_review_rating;
REFRESH MATERIALIZED VIEW materialized.prof_teaches_course;
REFRESH MATERIALIZED VIEW materialized.prof_search_index;
