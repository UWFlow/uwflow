-- Run with `make prof-merges` after migrations in each environment.
-- Calls are idempotent: merge_prof('<from>', '<into>') folds the from prof
-- into the into prof, which keeps its code and name.

-- FLOW-102: same professor, requested by them
SELECT merge_prof('josh_neufeld', 'josh_d_neufeld');
