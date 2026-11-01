// Bump the suffix when the search dump shape changes so stale caches are dropped.
export const SEARCH_DATA_ID = 'search_data_v3';
export const LAST_INDEXED_ID = 'last_indexed_v3';
export const LEGACY_SEARCH_KEYS = [
  'search_data',
  'last_indexed',
  'search_data_v2',
  'last_indexed_v2',
];
export const SEARCH_RESULTS_PER_PAGE = 75;
export const MAX_SEARCH_TERMS = 10;
