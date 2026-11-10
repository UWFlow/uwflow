-- Professors students report as missing from the review box. Only the Go API
-- reads this table: it is not tracked by Hasura, and the Slack bot role has no
-- grant because user_id identifies the submitter.
CREATE TABLE prof_submission (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
    CONSTRAINT prof_submission_name_length CHECK (LENGTH(name) BETWEEN 2 AND 100),
  course_id INT NOT NULL REFERENCES course(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id INT REFERENCES "user"(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A prof is only reported once per course, however many students submit them
CREATE UNIQUE INDEX prof_submission_name_course_key
  ON prof_submission (LOWER(name), course_id);

CREATE INDEX prof_submission_user_created_idx
  ON prof_submission (user_id, created_at);
