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
    CONSTRAINT course_antireqs_length CHECK (LENGTH(antireqs) <= 1024),
  sections JSONB,
  textbooks JSONB
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
  name TEXT NOT NULL
    CONSTRAINT prof_name_length CHECK (LENGTH(name) <= 256),
  picture_url TEXT
);

CREATE TABLE prof_course (
  prof_id INT NOT NULL
    REFERENCES prof(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  course_id INT NOT NULL
    REFERENCES course(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  PRIMARY KEY(prof_id, course_id)
);

CREATE TABLE "user" (
  id INT
    GENERATED BY DEFAULT AS IDENTITY
    PRIMARY KEY,
  full_name TEXT NOT NULL
    CONSTRAINT user_full_name_length CHECK (LENGTH(full_name) <= 256),
  program TEXT
    CONSTRAINT user_program_length CHECK (LENGTH(program) <= 256),
  picture_url TEXT
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
  CONSTRAINT course_uniquely_taken UNIQUE(course_id, user_id, term)
);

CREATE TABLE user_shortlist (
  course_id INT
    REFERENCES course(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  user_id INT
    REFERENCES "user"(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

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
  liked SMALLINT,
    CONSTRAINT liked_range CHECK (0 <= liked AND liked <= 5),
  useful SMALLINT
    CONSTRAINT useful_range CHECK (0 <= useful AND useful <= 5)
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
    CONSTRAINT engaging_range CHECK (0 <= engaging AND engaging <= 5)
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

-- Aggregations intractable in Hasura
CREATE SCHEMA aggregate;

CREATE VIEW aggregate.course_easy_buckets AS
SELECT course_id, easy, COUNT(*) AS count
FROM course_review GROUP BY course_id, easy;

CREATE VIEW aggregate.course_liked_buckets AS
SELECT course_id, liked, COUNT(*) AS count
FROM course_review GROUP BY course_id, liked;

CREATE VIEW aggregate.course_useful_buckets AS
SELECT course_id, useful, COUNT(*) AS count
FROM course_review GROUP BY course_id, useful;

CREATE VIEW aggregate.prof_clear_buckets AS
SELECT prof_id, clear, COUNT(*) AS count
FROM prof_review GROUP BY prof_id, clear;

CREATE VIEW aggregate.prof_engaging_buckets AS
SELECT prof_id, engaging, COUNT(*) AS count
FROM prof_review GROUP BY prof_id, engaging;

-- Credentials
CREATE SCHEMA secret;

CREATE TABLE secret.user_email (
  user_id INT
    REFERENCES "user"(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  email TEXT
    CONSTRAINT email_length CHECK (LENGTH(email) <= 256),
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