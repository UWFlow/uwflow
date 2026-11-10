-- Bring the migrations in line with production, so that a database rebuilt
-- from them matches the live schema. Production gained pgcrypto and
-- prof_rename outside of migrations, and lost two indexes that init creates
-- (likely when the materialized views were recreated by hand). Every
-- statement is idempotent, so this applies cleanly both to production and to
-- a fresh rebuild that already has the indexes.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Professor renames from a past data import. Nothing on main reads it, but
-- production holds rows in it, so it is tracked rather than dropped.
CREATE TABLE IF NOT EXISTS public.prof_rename (
  old_code TEXT NOT NULL,
  old_name TEXT NOT NULL,
  new_code TEXT NOT NULL,
  new_name TEXT NOT NULL,
  delete BOOLEAN NOT NULL
);

CREATE INDEX IF NOT EXISTS prof_rating_prof_id_fkey
ON materialized.prof_rating(prof_id);

CREATE INDEX IF NOT EXISTS idx_prof_search
ON materialized.prof_search_index USING GIN(document);
