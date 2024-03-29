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
    CONSTRAINT course_antireqs_length CHECK (LENGTH(antireqs) <= 1024),
  -- Whether the entry has been amended. If so, do not overwrite with ADM data.
  authoritative BOOLEAN NOT NULL DEFAULT FALSE
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

CREATE TABLE prof_remap (
  code TEXT PRIMARY KEY,
  prof_id INT NOT NULL
    REFERENCES prof(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE term (
  id INT PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL
);

CREATE TYPE JOIN_SOURCE AS ENUM ('email', 'facebook', 'google');

CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  secret_id TEXT NOT NULL UNIQUE
    CONSTRAINT secret_id_length CHECK (LENGTH(secret_id) = 16),
  first_name TEXT NOT NULL
    CONSTRAINT user_first_name_length CHECK (LENGTH(first_name) <= 256),
  last_name TEXT NOT NULL
    CONSTRAINT user_last_name_length CHECK (LENGTH(last_name) <= 256),
  full_name TEXT NOT NULL
    GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  program TEXT
    CONSTRAINT user_program_length CHECK (LENGTH(program) <= 256),
  picture_url TEXT,
  email TEXT
    CONSTRAINT email_length CHECK (LENGTH(email) <= 256)
    CONSTRAINT email_format CHECK (email ~* '^[A-Z0-9._%+*-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$'),
  join_source JOIN_SOURCE NOT NULL,
  join_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
  term_id INT NOT NULL,
  level TEXT,
  -- It is possible to re-take a course in a different term.
  -- However, it is not possible to take a course twice in the same term.
  CONSTRAINT course_uniquely_taken UNIQUE(user_id, term_id, course_id)
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
  term_id INT NOT NULL,
  section_name TEXT NOT NULL,
  enrollment_capacity INT NOT NULL,
  enrollment_total INT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT class_number_unique_to_term UNIQUE(class_number, term_id)
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

CREATE TABLE review (
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
  liked SMALLINT
    CONSTRAINT liked_range CHECK (0 <= liked AND liked <= 1),
  course_easy SMALLINT
    CONSTRAINT easy_range CHECK (0 <= course_easy AND course_easy <= 4),
  course_useful SMALLINT
    CONSTRAINT useful_range CHECK (0 <= course_useful AND course_useful <= 4),
  course_comment TEXT
    CONSTRAINT course_comment_length CHECK (LENGTH(course_comment) <= 8192),
  prof_clear SMALLINT
    CONSTRAINT clear_range CHECK (0 <= prof_clear AND prof_clear <= 4),
  prof_engaging SMALLINT
    CONSTRAINT engaging_range CHECK (0 <= prof_engaging AND prof_engaging <= 4),
  prof_comment TEXT
    CONSTRAINT prof_comment_length CHECK (LENGTH(prof_comment) <= 8192),
  public BOOLEAN NOT NULL,
  -- legacy reviews did not have an associated user in Flow 1.0 database
  -- such reviews have NULL user_id and skip course-taken and uniqueness checks
  legacy BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT course_uniquely_reviewed UNIQUE(course_id, user_id)
);

CREATE TABLE course_review_upvote (
  review_id INT NOT NULL
    REFERENCES review(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  user_id INT
    REFERENCES "user"(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT course_review_upvote_unique UNIQUE(review_id, user_id)
);

CREATE TABLE prof_review_upvote (
  review_id INT NOT NULL
    REFERENCES review(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  user_id INT
    REFERENCES "user"(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT prof_review_upvote_unique UNIQUE(review_id, user_id)
);

-- END PUBLIC TABLES

-- START PUBLIC VIEWS

CREATE VIEW course_postrequisite AS
SELECT
  prerequisite_id AS course_id,
  course_id AS postrequisite_id,
  is_corequisite
FROM course_prerequisite;

CREATE VIEW review_author AS
SELECT
  r.id AS review_id,
  u.program AS program,
  CASE
    WHEN r.public
    THEN u.full_name
    ELSE NULL
  END AS full_name,
  CASE
    WHEN r.public
    THEN u.picture_url
    ELSE NULL
  END AS picture_url
FROM review r
  LEFT JOIN "user" u ON r.user_id = u.id;

CREATE VIEW review_user_id AS
SELECT id AS review_id, user_id
FROM review;

-- END PUBLIC VIEWS

-- START PUBLIC INDEXES

CREATE INDEX course_section_course_id_fkey ON course_section(course_id);
CREATE INDEX section_meeting_prof_id_fkey ON section_meeting(prof_id);
CREATE INDEX section_meeting_section_id_fkey ON section_meeting(section_id);

-- there is a partial index on (course_id, ...), so only index the other fkeys
CREATE INDEX review_prof_id_fkey ON review(prof_id);
CREATE INDEX review_user_id_fkey ON review(user_id);

-- END PUBLIC INDEXES

-- START PUBLIC FUNCTIONS

CREATE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_review_updated_at
BEFORE UPDATE ON review
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

CREATE FUNCTION check_course_taken()
RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.legacy OR EXISTS(
      SELECT
      FROM user_course_taken
      WHERE user_id = NEW.user_id
      AND course_id = NEW.course_id
    )
    THEN RETURN NEW;
    ELSE RAISE EXCEPTION 'course must have been taken';
    END IF;
  END
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_check_course_taken
BEFORE INSERT ON review
FOR EACH ROW
EXECUTE PROCEDURE check_course_taken();

CREATE FUNCTION sendmail_notify()
RETURNS TRIGGER AS $$
    BEGIN
        PERFORM pg_notify('queue', TG_ARGV[0]);
        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

-- END PUBLIC FUNCTIONS

CREATE SCHEMA materialized;

-- START MATERIALIZED VIEWS

CREATE MATERIALIZED VIEW materialized.course_rating AS
SELECT
  course.id                AS course_id,
  -- We only consider reviews with non-NULL liked as filled.
  -- This is because it's impossible to submit anything else with NULL liked,
  -- but it *is* possible to have all fields be NULL by liking then unliking.
  COUNT(r.liked)           AS filled_count,
  COUNT(r.course_comment)  AS comment_count,
  AVG(r.liked)             AS liked,
  AVG(r.course_easy) / 4   AS easy,
  AVG(r.course_useful) / 4 AS useful
FROM course
  LEFT JOIN review r ON course.id = r.course_id
GROUP BY course.id;

CREATE MATERIALIZED VIEW materialized.prof_rating AS
SELECT
  prof.id                  AS prof_id,
  COUNT(r.liked)           AS filled_count,
  COUNT(r.prof_comment)    AS comment_count,
  -- prof.liked = 0.2 * course_reviews_with_prof.liked + 0.4 * prof.clear + 0.4 * prof.engaging
  0.2 * AVG(r.liked) + 0.4 * AVG(r.prof_clear) / 4 + 0.4 * AVG(r.prof_engaging) / 4 AS liked,
  AVG(r.prof_clear) / 4    AS clear,
  AVG(r.prof_engaging) / 4 AS engaging
FROM prof
  LEFT JOIN review r ON prof.id = r.prof_id
GROUP BY prof.id;

CREATE MATERIALIZED VIEW materialized.course_review_rating AS
SELECT review.id AS review_id, COUNT(u.review_id) AS upvote_count
FROM review
  LEFT JOIN course_review_upvote u ON review.id = u.review_id
GROUP BY review.id;

CREATE MATERIALIZED VIEW materialized.prof_review_rating AS
SELECT review.id AS review_id, COUNT(u.review_id) AS upvote_count
FROM review
  LEFT JOIN prof_review_upvote u ON review.id = u.review_id
GROUP BY review.id;

CREATE MATERIALIZED VIEW materialized.prof_teaches_course AS
SELECT DISTINCT cs.course_id, sm.prof_id
FROM course_section cs
  JOIN section_meeting sm ON sm.section_id = cs.id
WHERE sm.prof_id IS NOT NULL;

CREATE VIEW prof_teaches_course AS
SELECT * FROM materialized.prof_teaches_course;

CREATE MATERIALIZED VIEW materialized.course_search_index AS
SELECT
  course.id                                   AS course_id,
  course.code                                 AS code,
  course.name                                 AS name,
  ARRAY_TO_STRING(REGEXP_MATCHES(
    course.code, '^(.+?)[0-9]'), '')          AS course_letters,
  materialized.course_rating.filled_count     AS ratings,
  materialized.course_rating.liked            AS liked,
  materialized.course_rating.easy             AS easy,
  materialized.course_rating.useful           AS useful,
  COALESCE(ARRAY_AGG(DISTINCT course_section.term_id)
    FILTER (WHERE course_section.term_id IS NOT NULL),
    ARRAY[]::INT[])                           AS terms,
  COALESCE(ARRAY_AGG(DISTINCT materialized.prof_teaches_course.prof_id)
    FILTER (WHERE materialized.prof_teaches_course.prof_id IS NOT NULL),
    ARRAY[]::INT[])                           AS prof_ids,
  to_tsvector('simple', course.code) ||
  to_tsvector('simple', course.name) ||
  -- index course numbers to support queries where the course code is split
  -- ie) the query "ECE 105" should match both "ECE" and "105" because
  -- the frontend will translate the raw query to "ECE:* & 105:*"
  to_tsvector('simple', ARRAY_TO_STRING(REGEXP_MATCHES(course.code,
    '^[a-z|A-Z]+([0-9]+[a-z|A-Z]*)'), ''))    AS document
FROM course
  LEFT JOIN course_section ON course_section.course_id = course.id
  LEFT JOIN materialized.prof_teaches_course ON materialized.prof_teaches_course.course_id = course.id
  LEFT JOIN materialized.course_rating ON materialized.course_rating.course_id = course.id
GROUP BY course.id, ratings, liked, easy, useful;

CREATE VIEW course_search_index AS
SELECT * FROM materialized.course_search_index;

CREATE MATERIALIZED VIEW materialized.prof_search_index AS
SELECT
  prof.id                                     AS prof_id,
  prof.name                                   AS name,
  prof.code                                   AS code,
  materialized.prof_rating.filled_count       AS ratings,
  materialized.prof_rating.liked              AS liked,
  materialized.prof_rating.clear              AS clear,
  materialized.prof_rating.engaging           AS engaging,
  COALESCE(ARRAY_AGG(DISTINCT materialized.prof_teaches_course.course_id)
    FILTER (WHERE materialized.prof_teaches_course.course_id IS NOT NULL),
    ARRAY[]::INT[])                           AS course_ids,
  COALESCE(ARRAY(SELECT course.code FROM
    unnest(ARRAY_AGG(DISTINCT materialized.prof_teaches_course.course_id)
    FILTER (WHERE materialized.prof_teaches_course.course_id IS NOT NULL)) course_id
    LEFT JOIN course on course.id = course_id),
    ARRAY[]::TEXT[])                          AS course_codes,
  to_tsvector('simple', prof.name)            AS document
FROM prof
  LEFT JOIN materialized.prof_teaches_course ON materialized.prof_teaches_course.prof_id = prof.id
  LEFT JOIN materialized.prof_rating ON materialized.prof_rating.prof_id = prof.id
GROUP BY prof.id, ratings, liked, clear, engaging;

CREATE VIEW prof_search_index AS
SELECT * FROM materialized.prof_search_index;

-- END MATERIALIZED VIEWS

-- START MATERIALIZED INDEXES

CREATE INDEX course_rating_course_id_fkey ON materialized.course_rating(course_id);
CREATE INDEX prof_rating_prof_id_fkey ON materialized.prof_rating(prof_id);
CREATE INDEX course_review_rating_review_id_fkey ON materialized.course_review_rating(review_id);
CREATE INDEX prof_review_rating_review_id_fkey ON materialized.prof_review_rating(review_id);

CREATE INDEX prof_teaches_course_course_id_fkey ON materialized.prof_teaches_course(course_id);
CREATE INDEX prof_teaches_course_prof_id_fkey ON materialized.prof_teaches_course(prof_id);

CREATE INDEX idx_course_search ON materialized.course_search_index USING GIN(document);
CREATE INDEX idx_prof_search ON materialized.prof_search_index USING GIN(document);

-- END MATERIALIZED INDEXES

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

-- custom function to refresh search index materialized views 
-- after refreshing dependency views (course_rating, prof_rating, prof_teaches_course) 
CREATE FUNCTION refresh_section_meeting_views()
RETURNS TRIGGER AS $$
  BEGIN
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.course_rating;';
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.prof_rating;';
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.prof_teaches_course;';
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.course_search_index;';
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.prof_search_index;';
    RETURN NULL;
  END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION search_courses(query TEXT, code_only BOOLEAN)
RETURNS SETOF course_search_index AS $$
  BEGIN
    IF code_only THEN
      RETURN QUERY
      SELECT * FROM course_search_index
        WHERE course_letters ILIKE query
      ORDER BY ratings DESC;
    ELSE
      RETURN QUERY
      SELECT * FROM course_search_index
        WHERE document @@ to_tsquery('simple', query)
      UNION
      SELECT DISTINCT * FROM (SELECT unnest(course_ids) AS course_id
        FROM prof_search_index
        WHERE document @@ to_tsquery('simple', query)) prof_courses
        LEFT JOIN course_search_index USING (course_id)
      ORDER BY ratings DESC;
    END IF;
  END
$$ LANGUAGE plpgsql STABLE;

CREATE FUNCTION search_profs(query TEXT, code_only BOOLEAN)
RETURNS SETOF prof_search_index AS $$
  BEGIN
    IF code_only THEN
      RETURN QUERY
      SELECT DISTINCT * FROM (SELECT unnest(prof_ids) AS prof_id
        FROM course_search_index
        WHERE course_letters ILIKE query) course_profs
        LEFT JOIN prof_search_index USING (prof_id)
      ORDER BY ratings DESC;
    ELSE
      RETURN QUERY
      SELECT * FROM prof_search_index
        WHERE document @@ to_tsquery('simple', query)
      UNION
      SELECT DISTINCT * FROM (SELECT unnest(prof_ids) AS prof_id
        FROM course_search_index
        WHERE document @@ to_tsquery('simple', query)) course_profs
        LEFT JOIN prof_search_index USING (prof_id)
      ORDER BY ratings DESC;
    END IF;
  END;
$$ LANGUAGE plpgsql STABLE;

-- END MATERIALIZED FUNCTIONS

-- START MATERIALIZED TRIGGERS

CREATE TRIGGER refresh_course_rating
AFTER INSERT OR UPDATE OR DELETE ON review
FOR EACH STATEMENT
EXECUTE PROCEDURE refresh_view('materialized.course_rating');

CREATE TRIGGER refresh_prof_rating
AFTER INSERT OR UPDATE OR DELETE ON review
FOR EACH STATEMENT
EXECUTE PROCEDURE refresh_view('materialized.prof_rating');

CREATE TRIGGER refresh_course_review_rating
AFTER INSERT OR UPDATE OR DELETE ON course_review_upvote
FOR EACH STATEMENT
EXECUTE PROCEDURE refresh_view('materialized.course_review_rating');

CREATE TRIGGER refresh_prof_review_rating
AFTER INSERT OR UPDATE OR DELETE ON prof_review_upvote
FOR EACH STATEMENT
EXECUTE PROCEDURE refresh_view('materialized.prof_review_rating');

CREATE TRIGGER refresh_section_meeting
AFTER INSERT OR UPDATE OR DELETE ON section_meeting
FOR EACH STATEMENT
EXECUTE PROCEDURE refresh_section_meeting_views();

-- END MATERIALIZED TRIGGERS

-- Aggregations intractable in Hasura
CREATE SCHEMA aggregate;

-- START AGGREGATE VIEWS

CREATE VIEW aggregate.course_rating AS
SELECT * FROM materialized.course_rating;

CREATE VIEW aggregate.prof_rating AS
SELECT * FROM materialized.prof_rating;

CREATE VIEW aggregate.course_review_rating AS
SELECT * FROM materialized.course_review_rating;

CREATE VIEW aggregate.prof_review_rating AS
SELECT * FROM materialized.prof_review_rating;

CREATE VIEW aggregate.course_easy_buckets AS
SELECT course_id, course_easy AS value, COUNT(*) AS count
FROM review GROUP BY course_id, course_easy;

CREATE VIEW aggregate.course_useful_buckets AS
SELECT course_id, course_useful AS value, COUNT(*) AS count
FROM review GROUP BY course_id, course_useful;

CREATE VIEW aggregate.prof_clear_buckets AS
SELECT prof_id, prof_clear AS value, COUNT(*) AS count
FROM review GROUP BY prof_id, prof_clear;

CREATE VIEW aggregate.prof_engaging_buckets AS
SELECT prof_id, prof_engaging AS value, COUNT(*) AS count
FROM review GROUP BY prof_id, prof_engaging;

-- END AGGREGATE VIEWS

-- Credentials
CREATE SCHEMA secret;

-- START SECRET TABLES

CREATE TABLE secret.user_email (
  user_id INT PRIMARY KEY
    REFERENCES "user"(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  email TEXT NOT NULL
    CONSTRAINT user_email_unique UNIQUE
    CONSTRAINT email_length CHECK (LENGTH(email) <= 256)
    CONSTRAINT email_format CHECK (email ~* '^[A-Z0-9._%+*-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$'),
  password_hash TEXT NOT NULL
    CONSTRAINT password_hash_length CHECK (LENGTH(password_hash) = 60)
);

CREATE TABLE secret.user_fb (
  user_id INT PRIMARY KEY
    REFERENCES "user"(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  fb_id TEXT NOT NULL
    CONSTRAINT user_fb_id_unique UNIQUE
);

CREATE TABLE secret.user_google (
  user_id INT PRIMARY KEY
    REFERENCES "user"(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  google_id TEXT NOT NULL
    CONSTRAINT user_google_id_unique UNIQUE
);

-- END SECRET TABLES

CREATE SCHEMA queue;

CREATE TABLE queue.password_reset(
    user_id INT PRIMARY KEY
      REFERENCES "user"(id)
      ON UPDATE CASCADE
      ON DELETE CASCADE,
    secret_key TEXT NOT NULL
      CONSTRAINT key_length CHECK (LENGTH(secret_key) = 6),
    expiry TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    seen_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE queue.section_subscribed(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL
      REFERENCES "user"(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
    section_id INT NOT NULL
      REFERENCES course_section(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    seen_at TIMESTAMPTZ DEFAULT NULL,
    CONSTRAINT section_subscribed_unique UNIQUE(section_id, user_id)
);

CREATE TABLE queue.section_vacated(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL
      REFERENCES "user"(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
    course_id INT NOT NULL
      REFERENCES course(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
    section_names TEXT[] NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    seen_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TRIGGER notify_password_reset AFTER INSERT ON queue.password_reset
FOR EACH STATEMENT EXECUTE PROCEDURE sendmail_notify('password_reset');

CREATE TRIGGER notify_section_subscribed AFTER INSERT ON queue.section_subscribed
FOR EACH STATEMENT EXECUTE PROCEDURE sendmail_notify('section_subscribed');

CREATE TRIGGER notify_section_vacated AFTER INSERT ON queue.section_vacated
FOR EACH STATEMENT EXECUTE PROCEDURE sendmail_notify('section_vacated');

CREATE FUNCTION insert_course_vacated()
RETURNS TRIGGER AS $$
    BEGIN

    -- list of vacated sections
    WITH vacated AS (
       SELECT n.id AS section_id, n.course_id, n.section_name
       FROM updated_table n
        JOIN old_table o ON n.id = o.id
       WHERE o.enrollment_total >= n.enrollment_capacity
         AND n.enrollment_total < n.enrollment_capacity
    ),
    -- user -> course mapping for just the vacated sections
    vacated_user_course AS (
       SELECT DISTINCT ss.user_id, v.course_id
       FROM queue.section_subscribed ss
        JOIN vacated v ON v.section_id = ss.section_id
    )
    INSERT INTO queue.section_vacated(user_id, course_id, section_names)
    SELECT vuc.user_id, v.course_id, array_agg(v.section_name)
    FROM vacated v
      JOIN vacated_user_course vuc ON vuc.course_id = v.course_id
    GROUP BY vuc.user_id, v.course_id;

    RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_enrolment_update
AFTER UPDATE ON course_section
REFERENCING NEW TABLE AS updated_table OLD TABLE AS old_table
FOR EACH STATEMENT EXECUTE PROCEDURE insert_course_vacated();

-- tables used by importers and workers internally
CREATE SCHEMA work;

-- START WORK TABLES

CREATE TABLE work.course_delta(
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  prereqs TEXT,
  coreqs TEXT,
  antireqs TEXT
);

CREATE TABLE work.course_prerequisite_delta(
  course_code TEXT NOT NULL,
  prereq_code TEXT NOT NULL,
  is_coreq BOOLEAN NOT NULL
);

CREATE TABLE work.course_antirequisite_delta(
  course_code TEXT NOT NULL,
  antireq_code TEXT NOT NULL
);

CREATE TABLE work.section_exam_delta(
  course_code TEXT NOT NULL,
  section_name TEXT NOT NULL,
  term_id INT NOT NULL,
  location TEXT,
  start_seconds INT,
  end_seconds INT,
  date DATE,
  day TEXT,
  is_tba BOOLEAN NOT NULL
);

CREATE TABLE work.course_section_delta(
  class_number INT NOT NULL,
  course_code TEXT NOT NULL,
  section_name TEXT NOT NULL,
  term_id INT NOT NULL,
  enrollment_capacity INT NOT NULL,
  enrollment_total INT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE work.section_meeting_delta(
  class_number INT NOT NULL,
  term_id INT NOT NULL,
  prof_code TEXT,
  location TEXT,
  start_seconds INT,
  end_seconds INT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days TEXT[] NOT NULL,
  is_cancelled BOOLEAN NOT NULL,
  is_closed BOOLEAN NOT NULL,
  is_tba BOOLEAN NOT NULL
);

CREATE TABLE work.prof_delta(
  name TEXT NOT NULL,
  code TEXT NOT NULL
);

CREATE TABLE work.term_delta(
  id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL
);

-- END WORK TABLES
