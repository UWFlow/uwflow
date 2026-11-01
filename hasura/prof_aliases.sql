-- Run with `make prof-aliases` after migrations in each environment. Idempotent.
-- Renamed prof: INSERT INTO prof_alias SELECT id, '<other name>' FROM prof WHERE code = '<code>' ON CONFLICT DO NOTHING;
-- One person with two codes: SELECT merge_prof('<from code>', '<into code>');

-- FLOW-102
SELECT merge_prof('josh_neufeld', 'josh_d_neufeld');

REFRESH MATERIALIZED VIEW materialized.prof_search_index;
