CREATE TABLE course_review_downvote (
  review_id INT NOT NULL
    REFERENCES review(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  user_id INT NOT NULL
    REFERENCES "user"(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  PRIMARY KEY (review_id, user_id)
);

CREATE TABLE prof_review_downvote (
  review_id INT NOT NULL
    REFERENCES review(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  user_id INT NOT NULL
    REFERENCES "user"(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  PRIMARY KEY (review_id, user_id)
);

-- A user holds at most one vote per review, so a new vote replaces the
-- opposite one. The argument is the opposite vote table. The lock serializes
-- a user's concurrent votes on one review; without it both could commit.
CREATE FUNCTION replace_opposite_review_vote() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(NEW.review_id, NEW.user_id);
  EXECUTE format('DELETE FROM %I WHERE review_id = $1 AND user_id = $2', TG_ARGV[0])
    USING NEW.review_id, NEW.user_id;
  RETURN NEW;
END
$$;

CREATE TRIGGER replace_course_review_downvote
BEFORE INSERT ON course_review_upvote
FOR EACH ROW
EXECUTE PROCEDURE replace_opposite_review_vote('course_review_downvote');

CREATE TRIGGER replace_course_review_upvote
BEFORE INSERT ON course_review_downvote
FOR EACH ROW
EXECUTE PROCEDURE replace_opposite_review_vote('course_review_upvote');

CREATE TRIGGER replace_prof_review_downvote
BEFORE INSERT ON prof_review_upvote
FOR EACH ROW
EXECUTE PROCEDURE replace_opposite_review_vote('prof_review_downvote');

CREATE TRIGGER replace_prof_review_upvote
BEFORE INSERT ON prof_review_downvote
FOR EACH ROW
EXECUTE PROCEDURE replace_opposite_review_vote('prof_review_upvote');

DROP VIEW aggregate.course_review_rating;
DROP MATERIALIZED VIEW materialized.course_review_rating;

CREATE MATERIALIZED VIEW materialized.course_review_rating AS
SELECT
  review.id AS review_id,
  COALESCE(u.votes, 0) AS upvote_count,
  COALESCE(d.votes, 0) AS downvote_count
FROM review
  LEFT JOIN (
    SELECT review_id, COUNT(*) AS votes
    FROM course_review_upvote GROUP BY review_id
  ) u ON u.review_id = review.id
  LEFT JOIN (
    SELECT review_id, COUNT(*) AS votes
    FROM course_review_downvote GROUP BY review_id
  ) d ON d.review_id = review.id;

CREATE VIEW aggregate.course_review_rating AS
SELECT * FROM materialized.course_review_rating;

DROP VIEW aggregate.prof_review_rating;
DROP MATERIALIZED VIEW materialized.prof_review_rating;

CREATE MATERIALIZED VIEW materialized.prof_review_rating AS
SELECT
  review.id AS review_id,
  COALESCE(u.votes, 0) AS upvote_count,
  COALESCE(d.votes, 0) AS downvote_count
FROM review
  LEFT JOIN (
    SELECT review_id, COUNT(*) AS votes
    FROM prof_review_upvote GROUP BY review_id
  ) u ON u.review_id = review.id
  LEFT JOIN (
    SELECT review_id, COUNT(*) AS votes
    FROM prof_review_downvote GROUP BY review_id
  ) d ON d.review_id = review.id;

CREATE VIEW aggregate.prof_review_rating AS
SELECT * FROM materialized.prof_review_rating;

CREATE TRIGGER refresh_course_review_rating
AFTER INSERT OR UPDATE OR DELETE ON course_review_downvote
FOR EACH STATEMENT
EXECUTE PROCEDURE refresh_view('materialized.course_review_rating');

CREATE TRIGGER refresh_prof_review_rating
AFTER INSERT OR UPDATE OR DELETE ON prof_review_downvote
FOR EACH STATEMENT
EXECUTE PROCEDURE refresh_view('materialized.prof_review_rating');

-- The recreated views lost the Slack bot's grant. The downvote tables stay
-- unreadable to it until the bot needs them.
GRANT SELECT ON
  materialized.course_review_rating, aggregate.course_review_rating,
  materialized.prof_review_rating, aggregate.prof_review_rating
TO uwflow_slackbot;
