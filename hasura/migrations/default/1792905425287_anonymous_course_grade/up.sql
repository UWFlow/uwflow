-- Anonymized grades from uploaded transcripts. See flow/api/parse/anonymous.
-- Deliberately has no user id, primary key, or timestamps, and is not tracked
-- by Hasura: rows must not be linkable to each other or to the uploader.
-- Grade buckets are noised by randomized response; debias before analysis.
CREATE TABLE anonymous_course_grade (
  course_code TEXT NOT NULL,
  term_id INT NOT NULL,
  grade_bucket SMALLINT NOT NULL
    CHECK (grade_bucket IN (0, 50, 60, 70, 80, 90))
);

CREATE INDEX anonymous_course_grade_course_code_term_id_idx
ON anonymous_course_grade(course_code, term_id);

-- Latest term each user has contributed, so re-uploads are not double counted.
-- Records participation only, never grades. Not tracked by Hasura.
CREATE TABLE user_grade_contribution (
  user_id INT PRIMARY KEY
    REFERENCES "user"(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  last_term_id INT NOT NULL
);
