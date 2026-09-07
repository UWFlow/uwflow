\set ON_ERROR_STOP on
-- Run once as an administrator in the intended database. Intentionally fails
-- if the role already exists: do not silently reuse a potentially privileged role.
BEGIN;
CREATE ROLE flow_posthog NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE
    NOINHERIT NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 3;
ALTER ROLE flow_posthog SET default_transaction_read_only = on;
ALTER ROLE flow_posthog SET statement_timeout = '60s';
ALTER ROLE flow_posthog SET lock_timeout = '5s';
ALTER ROLE flow_posthog SET idle_in_transaction_session_timeout = '30s';
ALTER ROLE flow_posthog SET search_path = pg_catalog;
SELECT format('GRANT CONNECT ON DATABASE %I TO flow_posthog', current_database())
\gexec
-- No table grants, password, or LOGIN until the data/privilege audit in README.
COMMIT;
