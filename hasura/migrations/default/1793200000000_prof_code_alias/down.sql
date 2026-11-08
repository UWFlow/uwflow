-- Merged profs get their rows back, still empty; their reviews stay merged
INSERT INTO prof(id, name, code)
SELECT from_prof_id, from_name, from_code FROM prof_merge;

CREATE OR REPLACE FUNCTION merge_prof(from_code TEXT, into_code TEXT)
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
    INSERT INTO prof_alias SELECT keep_id, name FROM prof WHERE id = drop_id ON CONFLICT DO NOTHING;

    REFRESH MATERIALIZED VIEW materialized.prof_rating;
    REFRESH MATERIALIZED VIEW materialized.prof_review_rating;
    REFRESH MATERIALIZED VIEW materialized.prof_teaches_course;
    REFRESH MATERIALIZED VIEW materialized.course_search_index;
    REFRESH MATERIALIZED VIEW materialized.prof_search_index;
  END;
$$ LANGUAGE plpgsql;

ALTER TABLE prof_merge
  ADD CONSTRAINT prof_merge_from_prof_id_fkey
    FOREIGN KEY (from_prof_id) REFERENCES prof(id) ON UPDATE CASCADE,
  DROP COLUMN from_code,
  DROP COLUMN from_name;

ALTER TABLE prof_alias DROP COLUMN code;
