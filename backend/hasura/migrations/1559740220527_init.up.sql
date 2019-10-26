CREATE TABLE course (
  id INT
    GENERATED BY DEFAULT AS IDENTITY
    PRIMARY KEY,
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
    ON UPDATE CASCADE
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
  is_corequisite BOOLEAN NOT NULL
);

CREATE VIEW course_postrequisite AS
SELECT
  prerequisite_id AS course_id,
  course_id AS postrequisite_id,
  is_corequisite
FROM course_prerequisite;

CREATE TABLE prof (
  id INT
    GENERATED BY DEFAULT AS IDENTITY
    PRIMARY KEY,
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
  id INT
    GENERATED BY DEFAULT AS IDENTITY
    PRIMARY KEY,
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
  id INT
    GENERATED BY DEFAULT AS IDENTITY
    PRIMARY KEY,
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
  is_tba BOOLEAN NOT NULL
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
  course_id INT NOT NULL
    REFERENCES course(id)
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

CREATE VIEW prof_teaches_course AS
SELECT DISTINCT cs.course_id, sm.prof_id
FROM course_section cs
  JOIN section_meeting sm ON sm.section_id = cs.id;

CREATE TABLE course_review (
  id INT
    GENERATED BY DEFAULT AS IDENTITY
    PRIMARY KEY,
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
  id INT
    GENERATED BY DEFAULT AS IDENTITY
    PRIMARY KEY,
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
  PRIMARY KEY(review_id, user_id)
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
  PRIMARY KEY(review_id, user_id)
);

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

-- Aggregations intractable in Hasura
CREATE SCHEMA aggregate;

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

-- Credentials
CREATE SCHEMA secret;

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
