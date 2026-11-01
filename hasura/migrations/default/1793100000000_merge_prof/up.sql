-- Duplicate profs: when the same person shows up under two codes (e.g.
-- josh_neufeld and josh_d_neufeld), a maintainer calls merge_prof(from, into).
-- Reviews and sections move onto the into prof, the from prof is deleted, and
-- its code is kept in prof_remap so the importer maps it to the into prof
-- instead of recreating it.
-- Idempotent: does nothing if from_code already maps to into_code.
CREATE FUNCTION merge_prof(from_code TEXT, into_code TEXT)
RETURNS VOID AS $$
  DECLARE
    keep_id INT;
    drop_id INT;
  BEGIN
    from_code := LOWER(from_code);
    into_code := LOWER(into_code);

    IF from_code = into_code THEN
      RAISE EXCEPTION 'merge_prof: from and into code are both %', from_code;
    END IF;

    SELECT id INTO keep_id FROM prof WHERE code = into_code;
    IF keep_id IS NULL THEN
      RAISE EXCEPTION 'merge_prof: no prof with code %', into_code;
    END IF;

    IF EXISTS(SELECT FROM prof_remap WHERE code = from_code AND prof_id = keep_id) THEN
      RETURN;
    END IF;

    SELECT id INTO drop_id FROM prof WHERE code = from_code;
    IF drop_id IS NULL THEN
      RAISE EXCEPTION 'merge_prof: no prof with code %', from_code;
    END IF;

    -- Moving reviews between profs during a merge must not look like an edit
    ALTER TABLE review DISABLE TRIGGER set_review_updated_at;
    UPDATE review SET prof_id = keep_id WHERE prof_id = drop_id;
    ALTER TABLE review ENABLE TRIGGER set_review_updated_at;

    UPDATE section_meeting SET prof_id = keep_id WHERE prof_id = drop_id;
    UPDATE prof_remap SET prof_id = keep_id WHERE prof_id = drop_id;

    UPDATE prof k SET picture_url = COALESCE(k.picture_url, d.picture_url)
    FROM prof d
    WHERE k.id = keep_id AND d.id = drop_id;

    DELETE FROM prof WHERE id = drop_id;
    INSERT INTO prof_remap(code, prof_id) VALUES (from_code, keep_id)
    ON CONFLICT (code) DO UPDATE SET prof_id = EXCLUDED.prof_id;

    REFRESH MATERIALIZED VIEW materialized.prof_rating;
    REFRESH MATERIALIZED VIEW materialized.prof_review_rating;
    REFRESH MATERIALIZED VIEW materialized.prof_teaches_course;
    REFRESH MATERIALIZED VIEW materialized.course_search_index;
    REFRESH MATERIALIZED VIEW materialized.prof_search_index;
  END;
$$ LANGUAGE plpgsql;
