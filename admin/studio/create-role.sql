\set ON_ERROR_STOP on
-- Run once as the existing DB administrator, then use \password flow_studio.
-- Passwords must not appear in migrations, shell arguments, or SQL logs.
CREATE ROLE flow_studio LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE
    NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 10;
GRANT pg_read_all_data, pg_write_all_data TO flow_studio;
SELECT format('GRANT CONNECT ON DATABASE %I TO flow_studio', current_database()) \gexec
ALTER ROLE flow_studio SET statement_timeout = '30s';
ALTER ROLE flow_studio SET idle_in_transaction_session_timeout = '60s';
