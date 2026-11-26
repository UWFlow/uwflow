DROP VIEW aggregate.course_review_rating;
DROP MATERIALIZED VIEW materialized.course_review_rating;

CREATE MATERIALIZED VIEW materialized.course_review_rating AS
SELECT review.id AS review_id, COUNT(u.review_id) AS upvote_count
FROM review
  LEFT JOIN course_review_upvote u ON review.id = u.review_id
GROUP BY review.id;

CREATE VIEW aggregate.course_review_rating AS
SELECT * FROM materialized.course_review_rating;

DROP VIEW aggregate.prof_review_rating;
DROP MATERIALIZED VIEW materialized.prof_review_rating;

CREATE MATERIALIZED VIEW materialized.prof_review_rating AS
SELECT review.id AS review_id, COUNT(u.review_id) AS upvote_count
FROM review
  LEFT JOIN prof_review_upvote u ON review.id = u.review_id
GROUP BY review.id;

CREATE VIEW aggregate.prof_review_rating AS
SELECT * FROM materialized.prof_review_rating;

GRANT SELECT ON
  materialized.course_review_rating, aggregate.course_review_rating,
  materialized.prof_review_rating, aggregate.prof_review_rating
TO uwflow_slackbot;

DROP TRIGGER replace_course_review_downvote ON course_review_upvote;
DROP TRIGGER replace_prof_review_downvote ON prof_review_upvote;

DROP TABLE course_review_downvote;
DROP TABLE prof_review_downvote;

DROP FUNCTION replace_opposite_review_vote;
