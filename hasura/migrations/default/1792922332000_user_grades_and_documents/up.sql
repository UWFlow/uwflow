-- Grades from uploaded transcripts, saved only for users who opt in.
-- Unlike user_course_taken, these are private to the user: see the
-- owner-only permissions in metadata. Written by flow/api/parse.
CREATE TABLE user_course_grade (
  user_id INT NOT NULL
    REFERENCES "user"(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  course_id INT NOT NULL
    REFERENCES course(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  term_id INT NOT NULL,
  -- As printed on the transcript: a mark like 87 or a code like CR, NG, INC.
  grade TEXT NOT NULL
    CONSTRAINT user_course_grade_grade_length CHECK (LENGTH(grade) BETWEEN 1 AND 8),
  -- The grade as a number, or NULL for codes.
  mark SMALLINT
    CONSTRAINT user_course_grade_mark_range CHECK (mark BETWEEN 0 AND 100),
  PRIMARY KEY (user_id, term_id, course_id)
);

-- For finding students by course and mark, e.g. 80+ in CS 246.
CREATE INDEX user_course_grade_course_id_mark_idx
ON user_course_grade(course_id, mark);

-- Term and cumulative GPA as printed on the transcript, in percent.
-- NULL where no course with a mark has been completed yet (e.g. co-op terms).
CREATE TABLE user_term_gpa (
  user_id INT NOT NULL
    REFERENCES "user"(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  term_id INT NOT NULL,
  level TEXT,
  term_gpa NUMERIC(5, 2)
    CONSTRAINT user_term_gpa_term_gpa_range CHECK (term_gpa BETWEEN 0 AND 100),
  cumulative_gpa NUMERIC(5, 2)
    CONSTRAINT user_term_gpa_cumulative_gpa_range CHECK (cumulative_gpa BETWEEN 0 AND 100),
  PRIMARY KEY (user_id, term_id)
);

-- Files users upload, saved only after the API has removed their name and
-- other identifiers. kind leaves room for other documents, such as course
-- outlines. Not tracked by Hasura.
CREATE TABLE user_document (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL
    REFERENCES "user"(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  kind TEXT NOT NULL
    CONSTRAINT user_document_kind CHECK (kind IN ('transcript')),
  pdf BYTEA NOT NULL
    CONSTRAINT user_document_pdf_size CHECK (OCTET_LENGTH(pdf) <= 16 * 1024 * 1024),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A user has at most one saved transcript: a new upload replaces it.
CREATE UNIQUE INDEX user_document_user_id_transcript_idx
ON user_document(user_id) WHERE kind = 'transcript';
