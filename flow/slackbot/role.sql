-- Read-only Postgres role for the Slack bot. Run once per database as the
-- superuser, passing the password stored in Secrets Manager:
--
--   psql -v password="$SLACKBOT_POSTGRES_PASSWORD" -f role.sql
--
-- Safe to rerun: it resets the role's password and grants. Tables added later
-- are not readable until this is rerun, so new data is exposed deliberately.

\set ON_ERROR_STOP on

SELECT format('CREATE ROLE uwflow_slackbot LOGIN PASSWORD %L', :'password')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'uwflow_slackbot')
\gexec
ALTER ROLE uwflow_slackbot WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS
  PASSWORD :'password';
ALTER ROLE uwflow_slackbot SET default_transaction_read_only = on;
ALTER ROLE uwflow_slackbot SET statement_timeout = '15s';
ALTER ROLE uwflow_slackbot CONNECTION LIMIT 5;

BEGIN;

REVOKE ALL ON ALL TABLES IN SCHEMA public, aggregate, materialized FROM uwflow_slackbot;

-- Course, professor, review, and schedule data. secret, queue, and work are
-- left out: they hold login identities, pending emails, and import scratch.
GRANT USAGE ON SCHEMA public, aggregate, materialized TO uwflow_slackbot;
GRANT SELECT ON ALL TABLES IN SCHEMA public, aggregate, materialized TO uwflow_slackbot;

-- Users: only non-identifying columns.
REVOKE SELECT ON "user" FROM uwflow_slackbot;
GRANT SELECT (id, program, join_source, join_date) ON "user" TO uwflow_slackbot;

-- Names of reviewers who chose to stay anonymous must stay hidden, so the
-- per-review author views are out; review.user_id still allows counting.
REVOKE SELECT ON review_author, review_user_id FROM uwflow_slackbot;

COMMIT;
