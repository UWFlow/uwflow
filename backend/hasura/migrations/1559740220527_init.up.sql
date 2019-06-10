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
    CONSTRAINT course_description_length CHECK (LENGTH(name) <= 1024)
);

CREATE TABLE prof (
  id INT
    GENERATED BY DEFAULT AS IDENTITY
    PRIMARY KEY,
  name TEXT NOT NULL
    CONSTRAINT prof_name_length CHECK (LENGTH(name) <= 256)
);

CREATE TABLE "user" (
  id INT
    GENERATED BY DEFAULT AS IDENTITY
    PRIMARY KEY,
  name TEXT NOT NULL
    CONSTRAINT user_name_length CHECK (LENGTH(name) <= 256),
  program TEXT
    CONSTRAINT user_program_length CHECK (LENGTH(program) <= 256)
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
  easy BOOLEAN,
  liked BOOLEAN,
  useful BOOLEAN
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
  clear BOOLEAN,
  engaging BOOLEAN
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

CREATE VIEW aggregate.course_review_stats AS
SELECT
  course_id,
  SUM(CASE WHEN easy THEN 1 ELSE 0 END) AS easy,
  SUM(CASE WHEN NOT easy THEN 1 ELSE 0 END) AS not_easy,
  SUM(CASE WHEN liked THEN 1 ELSE 0 END) AS liked,
  SUM(CASE WHEN NOT liked THEN 1 ELSE 0 END) AS not_liked,
  SUM(CASE WHEN useful THEN 1 ELSE 0 END) AS useful,
  SUM(CASE WHEN NOT useful THEN 1 ELSE 0 END) AS not_useful
FROM course_review GROUP BY course_id;

CREATE VIEW aggregate.prof_review_stats AS
SELECT
  prof_id,
  SUM(CASE WHEN clear THEN 1 ELSE 0 END) AS clear,
  SUM(CASE WHEN NOT clear THEN 1 ELSE 0 END) AS not_clear,
  SUM(CASE WHEN engaging THEN 1 ELSE 0 END) AS engaging,
  SUM(CASE WHEN NOT engaging THEN 1 ELSE 0 END) AS not_engaging
FROM prof_review GROUP BY prof_id;

-- Credentials
CREATE SCHEMA secret;

CREATE TABLE secret.user_email (
  user_id INT
    REFERENCES "user"(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  email TEXT
    CONSTRAINT email_length CHECK (LENGTH(email) <= 256),
  password TEXT
    CONSTRAINT password_hash_length CHECK (LENGTH(password_hash) = 60)
);
