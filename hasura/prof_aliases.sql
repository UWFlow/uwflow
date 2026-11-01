-- Run with `make prof-aliases` after migrations in each environment. Idempotent.
-- add_prof_alias('<code>', '<other name>') or merge_prof('<from code>', '<into code>')

-- FLOW-102
SELECT merge_prof('josh_neufeld', 'josh_d_neufeld');
