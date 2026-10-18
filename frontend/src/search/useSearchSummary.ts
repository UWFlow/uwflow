import { useEffect, useState } from 'react';

import { BACKEND_ENDPOINT, SEARCH_SUMMARY_ENDPOINT } from 'constants/Api';
import { SearchSummaryCourse } from 'types/Api';

import { isSummaryQuery, parseServerSentEvents } from './summary';

// Longer than the related-courses debounce: each summary is an LLM call.
const DEBOUNCE_MS = 350;

export type SearchSummary = {
  // loading: waiting for the first words; text may still show the previous
  // answer so the card does not collapse between queries.
  status: 'idle' | 'loading' | 'streaming' | 'done' | 'error';
  text: string;
  courses: SearchSummaryCourse[];
};

const IDLE: SearchSummary = { status: 'idle', text: '', courses: [] };

/*
 * Streams a short AI answer for natural-language queries. Superseded
 * requests are aborted, and any failure hides the summary rather than
 * surfacing an error: autocomplete still works without it.
 */
const useSearchSummary = (query: string): SearchSummary => {
  const trimmed = query.trim();
  const enabled = isSummaryQuery(trimmed);
  const [summary, setSummary] = useState<SearchSummary>(IDLE);

  useEffect(() => {
    if (!enabled) {
      setSummary(IDLE);
      return undefined;
    }

    // Show the loading state immediately so the card appears as you type.
    setSummary((previous) => ({ ...previous, status: 'loading' }));

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      let started = false;
      const fail = () => {
        if (!controller.signal.aborted) {
          setSummary(IDLE);
        }
      };

      try {
        const res = await fetch(
          `${BACKEND_ENDPOINT}${SEARCH_SUMMARY_ENDPOINT}?q=${encodeURIComponent(
            trimmed,
          )}`,
          { signal: controller.signal },
        );
        if (!res.ok || !res.body) {
          fail();
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        for (;;) {
          // eslint-disable-next-line no-await-in-loop
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          const parsed = parseServerSentEvents(
            buffer + decoder.decode(value, { stream: true }),
          );
          buffer = parsed.rest;

          for (const { event, data } of parsed.events) {
            if (event === 'courses') {
              const courses: SearchSummaryCourse[] = JSON.parse(data);
              setSummary((previous) => ({ ...previous, courses }));
            } else if (event === 'delta') {
              const delta: string = JSON.parse(data);
              const first = !started;
              started = true;
              setSummary((previous) => ({
                ...previous,
                status: 'streaming',
                text: first ? delta : previous.text + delta,
              }));
            } else if (event === 'done') {
              if (started) {
                setSummary((previous) => ({ ...previous, status: 'done' }));
              } else {
                // Nothing matched: hide the card instead of showing it empty
                setSummary(IDLE);
              }
            } else if (event === 'error') {
              fail();
            }
          }
        }
      } catch {
        fail();
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [trimmed, enabled]);

  return summary;
};

export default useSearchSummary;
