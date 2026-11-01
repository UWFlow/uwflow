-- Run with `make prof-merges` after migrations in each environment.
-- Calls are idempotent: merge_prof('<from>', '<into>') records the merge in the
-- prof_merge ledger and shows the from prof as an alias of the into prof.

-- FLOW-102: same professor, requested by them
SELECT merge_prof('josh_neufeld', 'josh_d_neufeld');
