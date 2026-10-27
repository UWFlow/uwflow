-- Read-only access and activity notifications for the Slack data bot in
-- UWFlow/devops (slackbot/bot). The role's password is a secret, so it is set
-- outside migrations; until then the role cannot log in. Safe to apply to a
-- database that already has the role: its login and password are left alone.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'uwflow_slackbot') THEN
    CREATE ROLE uwflow_slackbot NOLOGIN;
  END IF;
END
$$;
ALTER ROLE uwflow_slackbot NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS CONNECTION LIMIT 5;
ALTER ROLE uwflow_slackbot SET default_transaction_read_only = on;
ALTER ROLE uwflow_slackbot SET statement_timeout = '15s';

-- Course, professor, review, and schedule data. secret, queue, and work hold
-- login identities, pending emails, and import scratch, so they stay out.
-- Tables added later are not readable until a migration grants them.
REVOKE ALL ON ALL TABLES IN SCHEMA public, aggregate, materialized FROM uwflow_slackbot;
GRANT USAGE ON SCHEMA public, aggregate, materialized TO uwflow_slackbot;
GRANT SELECT ON ALL TABLES IN SCHEMA public, aggregate, materialized TO uwflow_slackbot;

-- Users: only non-identifying columns.
REVOKE SELECT ON "user" FROM uwflow_slackbot;
GRANT SELECT (id, program, join_source, join_date) ON "user" TO uwflow_slackbot;

-- Reviewers who chose to stay anonymous must stay so; review.user_id still
-- allows counting.
REVOKE SELECT ON review_author, review_user_id FROM uwflow_slackbot;

-- The bot LISTENs on uwflow_activity and posts a card for each new review,
-- signup, and shortlisted course. Trigger arguments are the event kind, then
-- the column(s) identifying the row; the payload is "<kind>:<key>" with
-- multi-column keys joined by commas. The bot reads the rows through the role
-- above.
CREATE OR REPLACE FUNCTION slackbot_notify_activity() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  key text;
BEGIN
  SELECT string_agg(to_jsonb(NEW) ->> col, ',' ORDER BY n) INTO key
  FROM unnest(TG_ARGV[1:]) WITH ORDINALITY AS args(col, n);
  PERFORM pg_notify('uwflow_activity', TG_ARGV[0] || ':' || key);
  RETURN NULL;
END
$$;

CREATE OR REPLACE TRIGGER slackbot_review_activity
  AFTER INSERT ON review
  FOR EACH ROW EXECUTE FUNCTION slackbot_notify_activity('review', 'id');

CREATE OR REPLACE TRIGGER slackbot_signup_activity
  AFTER INSERT ON "user"
  FOR EACH ROW EXECUTE FUNCTION slackbot_notify_activity('signup', 'id');

CREATE OR REPLACE TRIGGER slackbot_shortlist_activity
  AFTER INSERT ON user_shortlist
  FOR EACH ROW EXECUTE FUNCTION slackbot_notify_activity('shortlist', 'user_id', 'course_id');
