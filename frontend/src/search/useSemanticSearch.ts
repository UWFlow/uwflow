import { useEffect, useState } from 'react';

import { BACKEND_ENDPOINT, SEMANTIC_SEARCH_ENDPOINT } from 'constants/Api';
import { SemanticSearchCourse, SemanticSearchResponse } from 'types/Api';
import { makeGETRequest } from 'utils/Api';
import { formatCourseCode } from 'utils/Misc';

// Unlike fuzzy autocomplete, each semantic query is a network round trip,
// so wait for a pause in typing before sending one.
const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 3;

type SemanticResults = {
  query: string;
  courses: SemanticSearchCourse[];
};

const EMPTY_RESULTS: SemanticSearchCourse[] = [];

/*
 * Returns courses related in meaning to the query, with codes formatted like
 * the fuzzy index ("CS 135"). Results are best-effort: errors and results for
 * an outdated query yield an empty list.
 */
const useSemanticSearch = (query: string): SemanticSearchCourse[] => {
  const trimmed = query.trim();
  const [results, setResults] = useState<SemanticResults>({
    query: '',
    courses: EMPTY_RESULTS,
  });

  useEffect(() => {
    if (trimmed.length < MIN_QUERY_LENGTH) {
      return undefined;
    }

    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        const [response, status] = await makeGETRequest<SemanticSearchResponse>(
          `${BACKEND_ENDPOINT}${SEMANTIC_SEARCH_ENDPOINT}?q=${encodeURIComponent(
            trimmed,
          )}`,
        );
        if (cancelled || status !== 200) {
          return;
        }
        setResults({
          query: trimmed,
          courses: response.courses.map((course) => ({
            ...course,
            code: formatCourseCode(course.code),
          })),
        });
      } catch {
        // Fuzzy results still work without semantic results.
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [trimmed]);

  return results.query === trimmed ? results.courses : EMPTY_RESULTS;
};

export default useSemanticSearch;
