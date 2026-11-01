-- Run with `make prof-aliases` after migrations in each environment.
-- Calls are idempotent. Search finds a prof under any of its aliases.
--   rename_prof('<code>', '<former name>', '<new name>'): same prof row, new name.
--   merge_prof('<from code>', '<into code>'): two rows for one person; recorded
--   in the prof_merge ledger, and the from prof's names become aliases.

-- FLOW-102: same professor, requested by them
SELECT merge_prof('josh_neufeld', 'josh_d_neufeld');

SELECT rename_prof('karen_yeats', 'Karen Yeats', 'Rowan "Ren" Yeats');
