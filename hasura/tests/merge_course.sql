-- Tests for merge_course(). Run against a disposable database that has every
-- migration applied; nothing is committed:
--   psql -v ON_ERROR_STOP=1 -U postgres < hasura/tests/merge_course.sql
BEGIN;

CREATE FUNCTION pg_temp.expect(ok BOOLEAN, label TEXT) RETURNS VOID AS $$
  BEGIN
    IF NOT ok THEN RAISE EXCEPTION 'FAILED: %', label; END IF;
  END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION pg_temp.expect_error(stmt TEXT, label TEXT) RETURNS VOID AS $$
  BEGIN
    BEGIN
      EXECUTE stmt;
    EXCEPTION WHEN OTHERS THEN
      RETURN;
    END;
    RAISE EXCEPTION 'FAILED (no error raised): %', label;
  END;
$$ LANGUAGE plpgsql;

INSERT INTO "user" (id, secret_id, first_name, last_name, join_source)
VALUES (9001, 'aaaaaaaaaaaaaaa1', 'A', 'One', 'email'),
       (9002, 'aaaaaaaaaaaaaaa2', 'B', 'Two', 'email');

INSERT INTO term (id, start_date, end_date) VALUES (1201, '2020-01-01', '2020-04-30');

-- Reviews require the user to have taken the course
CREATE FUNCTION pg_temp.take(c INT, u INT) RETURNS VOID AS $$
  INSERT INTO user_course_taken (course_id, user_id, term_id) VALUES (c, u, 1201);
$$ LANGUAGE sql;

-- 1. Plain rename: old row keeps its id and reviews, takes the new code
INSERT INTO course (id, code, name) VALUES (9001, 'tst100', 'Old Course');
SELECT pg_temp.take(9001, 9001);
INSERT INTO review (course_id, user_id, public, created_at, updated_at)
VALUES (9001, 9001, TRUE, '2020-01-01', '2020-01-01');
SELECT merge_course('TST100', 'TST200');
SELECT pg_temp.expect((SELECT code FROM course WHERE id = 9001) = 'tst200', 'new code on old row');
SELECT pg_temp.expect((SELECT course_id FROM course_alias WHERE code = 'tst100') = 9001, 'old code aliased');
SELECT pg_temp.expect((SELECT count(*) FROM review WHERE course_id = 9001) = 1, 'review kept');
SELECT pg_temp.expect((SELECT count(*) FROM course_code_lookup WHERE course_id = 9001) = 2, 'both codes resolve');

-- 2. Idempotent re-run changes nothing
SELECT merge_course('tst100', 'tst200');
SELECT pg_temp.expect((SELECT count(*) FROM course_alias WHERE course_id = 9001) = 1, 'idempotent');

-- 3. Importer already created the new code: rows merge onto the old id, and a
--    user who reviewed both keeps only their most recent review
INSERT INTO course (id, code, name) VALUES (9002, 'tst300', 'Old'), (9003, 'tst400', 'New');
SELECT pg_temp.take(9002, 9001), pg_temp.take(9003, 9001), pg_temp.take(9002, 9002);
INSERT INTO review (course_id, user_id, public, created_at, updated_at) VALUES
  (9002, 9001, TRUE, '2020-01-01', '2020-01-01'),
  (9003, 9001, TRUE, '2022-01-01', '2022-01-01'),
  (9002, 9002, TRUE, '2021-01-01', '2021-01-01');
INSERT INTO user_shortlist (course_id, user_id) VALUES (9002, 9001), (9003, 9001), (9003, 9002);
SELECT merge_course('tst300', 'tst400');
SELECT pg_temp.expect(NOT EXISTS(SELECT FROM course WHERE id = 9003), 'duplicate row removed');
SELECT pg_temp.expect((SELECT count(*) FROM review WHERE course_id = 9002) = 2, 'one review per user');
SELECT pg_temp.expect((SELECT updated_at FROM review WHERE course_id = 9002 AND user_id = 9001) = '2022-01-01', 'latest review wins');
SELECT pg_temp.expect((SELECT updated_at FROM review WHERE course_id = 9002 AND user_id = 9002) = '2021-01-01', 'moving a review is not an edit');
SELECT pg_temp.expect((SELECT count(*) FROM user_shortlist WHERE course_id = 9002) = 2, 'shortlists deduplicated');

-- 4. Errors
SELECT pg_temp.expect_error($$SELECT merge_course('nope1', 'nope2')$$, 'missing old course');
INSERT INTO course (id, code, name) VALUES (9004, 'tst500', 'Other');
SELECT pg_temp.expect_error($$SELECT merge_course('tst500', 'tst100')$$, 'new code already an alias');
SELECT pg_temp.expect_error($$SELECT merge_course('tst500', 'tst500')$$, 'same code');
SELECT pg_temp.expect_error($$INSERT INTO course (code, name) VALUES ('tst100', 'x')$$, 'alias code cannot become a course');

ROLLBACK;
