-- Functions in pg_temp will be purged on disconnect.
-- Generate random (hex) string of length n.
CREATE FUNCTION pg_temp.randstr(n INT)
RETURNS TEXT
LANGUAGE SQL
AS $$
  -- Each MD5 sum is 32 bytes. Generate as many as needed to fill out n bytes.
  SELECT SUBSTR((SELECT STRING_AGG(MD5(RANDOM()::TEXT), '')
  FROM GENERATE_SERIES(1, CEIL(n / 32.)::INT)), 1, n)
$$;

INSERT INTO course(code, name, description)
SELECT
  pg_temp.randstr(10),
  pg_temp.randstr(32),
  CASE WHEN RANDOM() > 0.5 THEN pg_temp.randstr(256) ELSE NULL END
FROM GENERATE_SERIES(1, COURSES);

INSERT INTO course_antirequisite(course_id, antirequisite_id)
SELECT
  CEIL(RANDOM() * COURSES)::INT,
  CEIL(RANDOM() * COURSES)::INT
FROM GENERATE_SERIES(1, 0.5 * COURSES);

INSERT INTO course_prerequisite(course_id, prerequisite_id, is_corequisite)
SELECT
  CEIL(RANDOM() * COURSES)::INT,
  CEIL(RANDOM() * COURSES)::INT,
  RANDOM() > 0.9
FROM GENERATE_SERIES(1, 5 * COURSES);

INSERT INTO prof(name)
SELECT
  pg_temp.randstr(10) || ' ' || pg_temp.randstr(10)
FROM GENERATE_SERIES(1, PROFS);

INSERT INTO "user"(name, program)
SELECT
  pg_temp.randstr(10) || ' ' || pg_temp.randstr(10),
  pg_temp.randstr(16)
FROM GENERATE_SERIES(1, USERS);

INSERT INTO course_review(course_id, prof_id, user_id, text, easy, liked, useful)
SELECT
  CEIL(RANDOM() * COURSES)::INT,
  CEIL(RANDOM() * PROFS)::INT,
  CEIL(RANDOM() * USERS)::INT,
  CASE WHEN RANDOM() > 0.9 THEN pg_temp.randstr(256) ELSE NULL END,
  CASE WHEN RANDOM() > 0.5 THEN FLOOR(RANDOM() * 6) ELSE NULL END,
  CASE WHEN RANDOM() > 0.5 THEN FLOOR(RANDOM() * 6) ELSE NULL END,
  CASE WHEN RANDOM() > 0.5 THEN FLOOR(RANDOM() * 6) ELSE NULL END
FROM GENERATE_SERIES(1, COURSE_REVIEWS);

INSERT INTO prof_review(course_id, prof_id, user_id, text, clear, engaging)
SELECT
  CEIL(RANDOM() * COURSES)::INT,
  CEIL(RANDOM() * PROFS)::INT,
  CEIL(RANDOM() * USERS)::INT,
  CASE WHEN RANDOM() > 0.9 THEN pg_temp.randstr(256) ELSE NULL END,
  CASE WHEN RANDOM() > 0.5 THEN RANDOM() > 0.5 ELSE NULL END,
  CASE WHEN RANDOM() > 0.5 THEN RANDOM() > 0.5 ELSE NULL END
FROM GENERATE_SERIES(1, PROF_REVIEWS);

INSERT INTO course_review_vote(review_id, user_id, vote)
SELECT
  CEIL(RANDOM() * PROF_REVIEWS)::INT,
  CEIL(RANDOM() * USERS)::INT,
  CASE WHEN RANDOM() > 0.5 THEN 1 ELSE -1 END
FROM GENERATE_SERIES(1, COURSE_REVIEW_VOTES);

INSERT INTO prof_review_vote(review_id, user_id, vote)
SELECT
  CEIL(RANDOM() * PROF_REVIEWS)::INT,
  CEIL(RANDOM() * USERS)::INT,
  CASE WHEN RANDOM() > 0.5 THEN 1 ELSE -1 END
FROM GENERATE_SERIES(1, PROF_REVIEW_VOTES);
