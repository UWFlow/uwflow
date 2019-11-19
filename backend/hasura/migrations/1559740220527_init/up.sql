-- START PUBLIC TABLES

CREATE TABLE course (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL
    CONSTRAINT course_code_unique UNIQUE
    CONSTRAINT course_code_length CHECK (LENGTH(code) <= 16),
  name TEXT NOT NULL
    CONSTRAINT course_name_length CHECK (LENGTH(name) <= 256),
  description TEXT
    CONSTRAINT course_description_length CHECK (LENGTH(name) <= 1024),
  prereqs TEXT
    CONSTRAINT course_prereqs_length CHECK (LENGTH(prereqs) <= 1024),
  coreqs TEXT
    CONSTRAINT course_coreqs_length CHECK (LENGTH(coreqs) <= 1024),
  antireqs TEXT
    CONSTRAINT course_antireqs_length CHECK (LENGTH(antireqs) <= 1024)
);

CREATE TABLE course_antirequisite (
  course_id INT
    REFERENCES course(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  antirequisite_id INT
    REFERENCES course(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT antirequisite_unique UNIQUE(course_id, antirequisite_id)
);

CREATE TABLE course_prerequisite (
  course_id INT
    REFERENCES course(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  prerequisite_id INT
    REFERENCES course(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  is_corequisite BOOLEAN NOT NULL,
  CONSTRAINT prerequisite_unique UNIQUE(course_id, prerequisite_id)
);

CREATE TABLE prof (
  id SERIAL PRIMARY KEY,
  -- unique handle of the form first(_middle)?_last
  code TEXT NOT NULL
    CONSTRAINT prof_code_unique UNIQUE,
  name TEXT NOT NULL
    CONSTRAINT prof_name_length CHECK (LENGTH(name) <= 256),
  picture_url TEXT
);

CREATE TABLE term_date (
  term INT PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL
);

CREATE TYPE JOIN_SOURCE AS ENUM ('email', 'facebook', 'google');

CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL
    CONSTRAINT user_full_name_length CHECK (LENGTH(full_name) <= 256),
  program TEXT
    CONSTRAINT user_program_length CHECK (LENGTH(program) <= 256),
  picture_url TEXT,
  email TEXT
    CONSTRAINT user_email_unique UNIQUE,
    CONSTRAINT email_length CHECK (LENGTH(email) <= 256),
  join_source JOIN_SOURCE NOT NULL
);

CREATE TABLE user_course_taken (
  course_id INT
    REFERENCES course(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  user_id INT
    REFERENCES "user"(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  term INT NOT NULL,
  level TEXT,
  -- It is possible to re-take a course in a different term.
  -- However, it is not possible to take a course twice in the same term.
  CONSTRAINT course_uniquely_taken UNIQUE(user_id, term, course_id)
);

CREATE TABLE user_shortlist (
  course_id INT
    REFERENCES course(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  user_id INT
    REFERENCES "user"(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT course_uniquely_shortlisted UNIQUE(user_id, course_id)
);

CREATE TABLE course_section (
  id SERIAL PRIMARY KEY,
  class_number INT NOT NULL,
  course_id INT NOT NULL
    REFERENCES course(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  section TEXT NOT NULL,
  campus TEXT NOT NULL,
  term INT NOT NULL,
  enrollment_capacity INT NOT NULL,
  enrollment_total INT NOT NULL,
  CONSTRAINT class_number_unique_to_term UNIQUE(class_number, term)
);

CREATE TABLE section_exam (
  section_id INT NOT NULL
    REFERENCES course_section(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  location TEXT,
  start_seconds INT,
  end_seconds INT,
  date DATE,
  day TEXT,
  is_tba BOOLEAN NOT NULL,
  CONSTRAINT exam_unique_to_section UNIQUE(section_id)
);

CREATE TABLE section_meeting (
  section_id INT NOT NULL
    REFERENCES course_section(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  prof_id INT
    REFERENCES prof(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  location TEXT,
  -- We could store these as TIMETZ, but that is a waste of space:
  -- seconds do not require 12 bytes of storage.
  -- Another advantage of this format is ease of serialization
  -- and simplicity (no need to involve timezones).
  start_seconds INT,
  end_seconds INT,
  -- Date must always be filled. When UW API returns null,
  -- we simply fill it with the correponding term-wide date.
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days TEXT[] NOT NULL,
  is_cancelled BOOLEAN NOT NULL,
  is_closed BOOLEAN NOT NULL,
  is_tba BOOLEAN NOT NULL
);

CREATE TABLE section_subscriptions (
  user_id INT NOT NULL
    REFERENCES "user"(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  section_id INT NOT NULL
    REFERENCES course_section(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT section_subscription_unique UNIQUE(user_id, section_id)
);

CREATE TABLE user_schedule (
  user_id INT NOT NULL
    REFERENCES "user"(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  section_id INT NOT NULL
    REFERENCES course_section(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT section_uniquely_taken UNIQUE(user_id, section_id)
);

CREATE TABLE course_review (
  id SERIAL PRIMARY KEY,
  course_id INT
    REFERENCES course(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  prof_id INT
    REFERENCES prof(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  user_id INT
    REFERENCES "user"(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  text TEXT
    CONSTRAINT course_review_length CHECK (LENGTH(text) <= 8192),
  easy SMALLINT
    CONSTRAINT easy_range CHECK (0 <= easy AND easy <= 5),
  liked SMALLINT
    CONSTRAINT liked_range CHECK (0 <= liked AND liked <= 1),
  useful SMALLINT
    CONSTRAINT useful_range CHECK (0 <= useful AND useful <= 5),
  public BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE prof_review (
  id SERIAL PRIMARY KEY,
  course_id INT
    REFERENCES course(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  prof_id INT
    REFERENCES prof(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  user_id INT
    REFERENCES "user"(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  text TEXT
    CONSTRAINT prof_review_length CHECK (LENGTH(text) <= 8192),
  clear SMALLINT
    CONSTRAINT clear_range CHECK (0 <= clear AND clear <= 5),
  engaging SMALLINT
    CONSTRAINT engaging_range CHECK (0 <= engaging AND engaging <= 5),
  public BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE course_review_vote (
  review_id INT NOT NULL
    REFERENCES course_review(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  user_id INT NOT NULL
    REFERENCES "user"(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  vote INT NOT NULL
    CONSTRAINT vote_range CHECK (vote = -1 OR vote = 1),
  CONSTRAINT course_review_vote_unique UNIQUE(review_id, user_id)
);

CREATE TABLE prof_review_vote (
  review_id INT NOT NULL
    REFERENCES prof_review(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  user_id INT NOT NULL
    REFERENCES "user"(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  vote INT NOT NULL
    CONSTRAINT vote_range CHECK (vote = -1 OR vote = 1),
  CONSTRAINT prof_review_vote_unique UNIQUE(review_id, user_id)
);

-- END PUBLIC TABLES

-- START PUBLIC VIEWS

CREATE VIEW course_postrequisite AS
SELECT
  prerequisite_id AS course_id,
  course_id AS postrequisite_id,
  is_corequisite
FROM course_prerequisite;

CREATE VIEW prof_teaches_course AS
SELECT DISTINCT cs.course_id, sm.prof_id
FROM course_section cs
  JOIN section_meeting sm ON sm.section_id = cs.id;

CREATE VIEW course_review_author AS
SELECT
  cr.id AS review_id,
  u.program AS program,
  CASE
    WHEN cr.public
    THEN u.full_name
    ELSE NULL
  END AS full_name,
  CASE
    WHEN cr.public
    THEN u.picture_url
    ELSE NULL
  END AS picture_url
FROM course_review cr
  JOIN "user" u ON cr.user_id = u.id;

CREATE VIEW course_review_user_id AS
SELECT id AS review_id, user_id
FROM course_review;

CREATE VIEW prof_review_author AS
SELECT
  pr.id AS review_id,
  u.program AS program,
  CASE
    WHEN pr.public
    THEN u.full_name
    ELSE NULL
  END AS full_name,
  CASE
    WHEN pr.public
    THEN u.picture_url
    ELSE NULL
  END AS picture_url
FROM prof_review pr
  JOIN "user" u ON pr.user_id = u.id;

CREATE VIEW prof_review_user_id AS
SELECT id AS review_id, user_id
FROM prof_review;

-- END PUBLIC VIEWS

-- START PUBLIC INDEXES

CREATE INDEX course_section_course_id_fkey ON course_section(course_id);
CREATE INDEX section_meeting_prof_id_fkey ON section_meeting(prof_id);
CREATE INDEX section_meeting_section_id_fkey ON section_meeting(section_id);

CREATE INDEX course_review_course_id_fkey ON course_review(course_id);
CREATE INDEX course_review_prof_id_fkey ON course_review(prof_id);
CREATE INDEX course_review_user_id_fkey ON course_review(user_id);

CREATE INDEX prof_review_course_id_fkey ON prof_review(course_id);
CREATE INDEX prof_review_prof_id_fkey ON prof_review(prof_id);
CREATE INDEX prof_review_user_id_fkey ON prof_review(user_id);

-- END PUBLIC INDEXES

-- START PUBLIC FUNCTIONS

CREATE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_course_review_updated_at
BEFORE UPDATE ON course_review
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER set_prof_review_updated_at
BEFORE UPDATE ON prof_review
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

-- END PUBLIC FUNCTIONS

CREATE SCHEMA materialized;

-- START MATERIALIZED VIEWS

CREATE MATERIALIZED VIEW materialized.course_rating AS
SELECT
  course_id,
  COUNT(*)        AS total_count,
  COUNT(text)     AS comment_count,
  AVG(liked)      AS liked,
  AVG(easy) / 5   AS easy,
  AVG(useful) / 5 AS useful
FROM course_review
GROUP BY course_id;

CREATE MATERIALIZED VIEW materialized.prof_rating AS
SELECT
  prof_id,
  COUNT(*)          AS total_count,
  COUNT(text)       AS comment_count,
  AVG(clear) / 5    AS clear,
  AVG(engaging) / 5 AS engaging
FROM prof_review
GROUP BY prof_id;

-- END MATERIALIZED VIEWS

-- START MATERIALIZED FUNCTIONS

CREATE FUNCTION refresh_view()
RETURNS TRIGGER AS $$
  DECLARE sql TEXT;
  BEGIN
    sql := 'REFRESH MATERIALIZED VIEW ' || TG_ARGV[0];
    EXECUTE sql;
    RETURN NULL;
  END;
$$ LANGUAGE plpgsql;

-- END MATERIALIZED FUNCTIONS

-- START MATERIALIZED TRIGGERS

CREATE TRIGGER refresh_course_rating
AFTER INSERT OR UPDATE OR DELETE ON course_review
FOR EACH STATEMENT
EXECUTE PROCEDURE refresh_view('materialized.course_rating');

CREATE TRIGGER refresh_prof_rating
AFTER INSERT OR UPDATE OR DELETE ON prof_review
FOR EACH STATEMENT
EXECUTE PROCEDURE refresh_view('materialized.prof_rating');

-- END MATERIALIZED TRIGGERS

-- Aggregations intractable in Hasura
CREATE SCHEMA aggregate;

-- START AGGREGATE VIEWS

CREATE VIEW aggregate.course_rating AS
SELECT * FROM materialized.course_rating;

CREATE VIEW aggregate.prof_rating AS
SELECT * FROM materialized.prof_rating;

CREATE VIEW aggregate.course_easy_buckets AS
SELECT course_id, easy AS value, COUNT(*) AS count
FROM course_review GROUP BY course_id, easy;

CREATE VIEW aggregate.course_useful_buckets AS
SELECT course_id, useful AS value, COUNT(*) AS count
FROM course_review GROUP BY course_id, useful;

CREATE VIEW aggregate.prof_clear_buckets AS
SELECT prof_id, clear AS value, COUNT(*) AS count
FROM prof_review GROUP BY prof_id, clear;

CREATE VIEW aggregate.prof_engaging_buckets AS
SELECT prof_id, engaging AS value, COUNT(*) AS count
FROM prof_review GROUP BY prof_id, engaging;

-- END AGGREGATE VIEWS

-- Credentials
CREATE SCHEMA secret;

-- START SECRET TABLES

CREATE TABLE secret.user_email (
  user_id INT
    REFERENCES "user"(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  password_hash TEXT
    CONSTRAINT password_hash_length CHECK (LENGTH(password_hash) = 60)
);

CREATE TABLE secret.user_fb (
  user_id INT
    REFERENCES "user"(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  fb_id TEXT
);

CREATE TABLE secret.user_google (
  user_id INT
    REFERENCES "user"(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  google_id TEXT
);

CREATE TABLE secret.password_reset (
  user_id INT
    REFERENCES "user"(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  verify_key TEXT
    CONSTRAINT key_length CHECK (LENGTH(verify_key) = 6),
  expiry TIMESTAMPTZ
);

-- END SECRET TABLES

-- START SECRET INDEXES

CREATE INDEX user_email_user_id_fkey ON secret.user_email(user_id);
CREATE INDEX user_fb_user_id_fkey ON secret.user_fb(user_id);
CREATE INDEX user_google_user_id_fkey ON secret.user_google(user_id);

-- END SECRET INDEXES
