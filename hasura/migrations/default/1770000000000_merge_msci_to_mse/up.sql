-- Merge MSCI course codes into MSE and make the helper reusable for future renames.
CREATE OR REPLACE FUNCTION public.merge_course(old_code text, new_code text)
RETURNS void AS $$
DECLARE
  old_id int;
  new_id int;
BEGIN
  old_code := lower(old_code);
  new_code := lower(new_code);

  SELECT id INTO old_id FROM course WHERE code = old_code;
  SELECT id INTO new_id FROM course WHERE code = new_code;

  IF old_id IS NULL THEN
    RETURN;
  END IF;

  IF new_id IS NULL THEN
    UPDATE course SET code = new_code WHERE id = old_id;
    RETURN;
  END IF;

  INSERT INTO course_prerequisite(course_id, prerequisite_id, is_corequisite)
  SELECT new_id, prerequisite_id, is_corequisite
  FROM course_prerequisite
  WHERE course_id = old_id
  ON CONFLICT DO NOTHING;

  INSERT INTO course_prerequisite(course_id, prerequisite_id, is_corequisite)
  SELECT course_id, new_id, is_corequisite
  FROM course_prerequisite
  WHERE prerequisite_id = old_id
  ON CONFLICT DO NOTHING;

  DELETE FROM course_prerequisite WHERE course_id = old_id OR prerequisite_id = old_id;

  INSERT INTO course_antirequisite(course_id, antirequisite_id)
  SELECT new_id, antirequisite_id
  FROM course_antirequisite
  WHERE course_id = old_id
  ON CONFLICT DO NOTHING;

  INSERT INTO course_antirequisite(course_id, antirequisite_id)
  SELECT course_id, new_id
  FROM course_antirequisite
  WHERE antirequisite_id = old_id
  ON CONFLICT DO NOTHING;

  DELETE FROM course_antirequisite WHERE course_id = old_id OR antirequisite_id = old_id;

  UPDATE course_section SET course_id = new_id WHERE course_id = old_id;

  INSERT INTO user_course_taken(course_id, user_id, term_id, level)
  SELECT new_id, user_id, term_id, level
  FROM user_course_taken
  WHERE course_id = old_id
  ON CONFLICT DO NOTHING;
  DELETE FROM user_course_taken WHERE course_id = old_id;

  INSERT INTO user_shortlist(course_id, user_id)
  SELECT new_id, user_id
  FROM user_shortlist
  WHERE course_id = old_id
  ON CONFLICT DO NOTHING;
  DELETE FROM user_shortlist WHERE course_id = old_id;

  INSERT INTO review(course_id, prof_id, user_id, liked, course_easy, course_useful, course_comment, prof_clear, prof_engaging, prof_comment, public, legacy, created_at, updated_at)
  SELECT new_id, prof_id, user_id, liked, course_easy, course_useful, course_comment, prof_clear, prof_engaging, prof_comment, public, legacy, created_at, updated_at
  FROM review
  WHERE course_id = old_id
  ON CONFLICT (course_id, user_id) DO NOTHING;
  DELETE FROM review WHERE course_id = old_id;

  DELETE FROM course WHERE id = old_id;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN SELECT code FROM course WHERE code LIKE 'msci%' LOOP
    PERFORM merge_course(rec.code, 'mse' || substring(rec.code FROM 5));
  END LOOP;
END $$;

REFRESH MATERIALIZED VIEW materialized.course_rating;
REFRESH MATERIALIZED VIEW materialized.course_search_index;
REFRESH MATERIALIZED VIEW materialized.course_review_rating;
