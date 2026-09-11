import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
  ExploreAllQuery,
  ExploreAllQueryVariables,
  ExploreQuery,
  ExploreQueryVariables,
} from 'generated/graphql';
import { debounce } from 'lodash';
import queryString from 'query-string';

import { SEO_DESCRIPTIONS } from 'constants/Messages';
import { MAX_SEARCH_TERMS } from 'constants/Search';
import {
  EXPLORE_ALL_QUERY,
  EXPLORE_QUERY,
} from 'graphql/queries/explore/Explore';
import { SearchFilterState } from 'types/Common';

import { EXPLORE_PAGE_ROUTE } from '../../Routes';

import {
  Column1,
  Column2,
  ColumnWrapper,
  ExploreHeaderText,
  ExploreHeaderWrapper,
  ExplorePageWrapper,
} from './styles/ExplorePage';
import SearchFilter from './SearchFilter';
import SearchResults from './SearchResults';

export const NUM_COURSE_CODE_FILTERS = 5;

// Single source of truth for the URL query param name behind each filter.
// Serializing and reading back through the SAME names is what keeps filters
// alive across browser navigation (e.g. /explore -> /course/xyz -> back).
const FILTER_PARAM = {
  excludedCourses: 'exclude',
  minCourseRatings: 'minCourseRatings',
  minProfRatings: 'minProfRatings',
  courseTaught: 'courseTaught',
  currentTerm: 'currentTerm',
  nextTerm: 'nextTerm',
  hasRoomAvailable: 'hasRoomAvailable',
  hasOnlineCourse: 'hasOnlineCourse',
  sortBy: 'sortBy',
  exploreTab: 'tab',
};

// SearchFilterState -> plain object ready for queryString.stringify.
// Falsy filters become null so `skipNull` drops them and the URL stays clean.
const filterStateToUrlQuery = (sf: SearchFilterState) => {
  const excludedCourses = sf.courseCodes
    .map((isIncluded, index) => (isIncluded ? -1 : index))
    .filter((index) => index >= 0);

  return {
    [FILTER_PARAM.excludedCourses]:
      excludedCourses.length > 0 ? excludedCourses : null,
    [FILTER_PARAM.minCourseRatings]: sf.numCourseRatings || null,
    [FILTER_PARAM.minProfRatings]: sf.numProfRatings || null,
    [FILTER_PARAM.courseTaught]: sf.courseTaught || null,
    [FILTER_PARAM.currentTerm]: sf.currentTerm || null,
    [FILTER_PARAM.nextTerm]: sf.nextTerm || null,
    [FILTER_PARAM.hasRoomAvailable]: sf.hasRoomAvailable || null,
    [FILTER_PARAM.hasOnlineCourse]: sf.hasOnlineSection || null,
    [FILTER_PARAM.sortBy]: sf.sortBy || null,
    [FILTER_PARAM.exploreTab]: sf.exploreTab === 1 ? 'prof' : null,
  };
};

// location.search -> SearchFilterState. Inverse of filterStateToUrlQuery.
const urlQueryToFilterState = (search: string): SearchFilterState => {
  const pq = queryString.parse(search, { arrayFormat: 'comma' });

  // query-string gives a string for one value and an array for many, so
  // normalize to an array before reading the excluded course indices.
  const rawExcluded = pq[FILTER_PARAM.excludedCourses] || [];
  const courseCodes = Array(NUM_COURSE_CODE_FILTERS).fill(true);
  ([] as string[]).concat(rawExcluded).forEach((index) => {
    courseCodes[parseInt(index, 10)] = false;
  });

  const asNumber = (value: any) => parseInt(value, 10) || 0;

  return {
    courseCodes,
    numCourseRatings: asNumber(pq[FILTER_PARAM.minCourseRatings]),
    numProfRatings: asNumber(pq[FILTER_PARAM.minProfRatings]),
    courseTaught: asNumber(pq[FILTER_PARAM.courseTaught]),
    currentTerm: Boolean(pq[FILTER_PARAM.currentTerm]),
    nextTerm: Boolean(pq[FILTER_PARAM.nextTerm]),
    hasRoomAvailable: Boolean(pq[FILTER_PARAM.hasRoomAvailable]),
    hasOnlineSection: Boolean(pq[FILTER_PARAM.hasOnlineCourse]),
    sortBy: (pq[FILTER_PARAM.sortBy] as string) || '',
    exploreTab: pq[FILTER_PARAM.exploreTab] === 'prof' ? 1 : 0,
  };
};

type ExplorePageContentProps = {
  query: string;
  codeSearch: boolean;
  error: boolean;
  loading: boolean;
  data?: ExploreAllQuery | ExploreQuery;
};

const ExplorePageContent = ({
  query,
  codeSearch,
  data,
  error,
  loading,
}: ExplorePageContentProps) => {
  const location = useLocation();

  const [filterState, setFilterState] = useState<SearchFilterState>(
    urlQueryToFilterState(location.search),
  );

  const [profCourses, setProfCourses] = useState<string[]>(['all courses']);
  const { exploreTab } = filterState;
  const setExploreTab = (tab: number) => {
    setFilterState((prev) => ({ ...prev, exploreTab: tab }));
  };
  const exploreAll = query === '';

  useEffect(() => {
    if (data === undefined) {
      return;
    }

    const allProfs = exploreAll
      ? (data as ExploreAllQuery).prof_search_index
      : (data as ExploreQuery).search_profs;

    const seenCourses = new Set();
    const parsedProfCourses = allProfs
      .reduce((acc: string[], result) => {
        return acc.concat(
          result.course_codes
            .filter((code: string) => !seenCourses.has(code))
            .map((code: string) => {
              seenCourses.add(code);
              return code;
            }),
        );
      }, [])
      .sort((a, b) => a.localeCompare(b));

    setProfCourses(['all courses'].concat(parsedProfCourses));
  }, [data, exploreAll]);

  // Debounced URL sync. A slider drag fires setFilterState on every pointer
  // move (dozens per second on touch devices); writing window.history on each
  // one trips Safari's "100 replaceState calls / 10s" limit and throws a
  // SecurityError. Debouncing collapses a drag into a single trailing write
  // once the value settles, and the identity check skips no-op writes.
  const syncUrlToHistory = useMemo(
    () =>
      debounce((nextUrl: string) => {
        const currentUrl = `${window.location.pathname}${window.location.search}`;
        if (nextUrl !== currentUrl) {
          window.history.replaceState({}, '', nextUrl);
        }
      }, 150),
    [],
  );

  // Cancel any pending write on unmount so a trailing call can't fire after the
  // user has navigated to another route and overwrite that route's URL.
  useEffect(() => () => syncUrlToHistory.cancel(), [syncUrlToHistory]);

  useEffect(() => {
    const urlQuery = queryString.stringify(filterStateToUrlQuery(filterState), {
      arrayFormat: 'comma',
      skipNull: true,
    });

    syncUrlToHistory(
      urlQuery ? `${EXPLORE_PAGE_ROUTE}?${urlQuery}` : EXPLORE_PAGE_ROUTE,
    );
  }, [filterState, syncUrlToHistory]);

  return (
    <ExplorePageWrapper>
      <ExploreHeaderWrapper>
        <ExploreHeaderText>
          {codeSearch
            ? `Showing all ${query.toUpperCase()} courses and professors`
            : exploreAll
            ? `Showing all courses and professors`
            : `Showing results for "${query}"`}
        </ExploreHeaderText>
      </ExploreHeaderWrapper>
      <ColumnWrapper>
        <Column1>
          <SearchResults
            filterState={filterState}
            setFilterState={setFilterState}
            data={data}
            error={error}
            exploreTab={exploreTab}
            setExploreTab={setExploreTab}
            profCourses={profCourses}
            loading={loading}
            exploreAll={exploreAll}
          />
        </Column1>
        <Column2>
          <SearchFilter
            profCourses={profCourses}
            filterState={filterState}
            setFilterState={setFilterState}
            resetFilters={() => setFilterState(urlQueryToFilterState(''))}
            courseSearch={exploreTab === 0}
          />
        </Column2>
      </ColumnWrapper>
    </ExplorePageWrapper>
  );
};

const processRawQuery = (query = '', codeOnly = false) => {
  if (query === '') {
    return '';
  }

  const queryTerms = query
    .toLowerCase()
    .replace('-', ' ')
    // remove all special characters for postgres ts_query
    .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi, '')
    .split(' ')
    .map((term) => term.trim())
    .filter((term) => term.length > 0)
    .slice(0, MAX_SEARCH_TERMS);

  return codeOnly ? query : queryTerms.map((term) => `${term}:*`).join(' & ');
};

const ExplorePage = () => {
  const location = useLocation();
  const { q, c: code } = queryString.parse(location.search);

  const query: string = (q as string) || '';
  const codeSearch = !!code;

  const processedQueryText = processRawQuery(query, codeSearch);
  const queryVariables =
    processedQueryText === ''
      ? {}
      : {
          query: processedQueryText,
          code_only: codeSearch,
        };

  const { data, error, loading } = useQuery<
    ExploreAllQuery | ExploreQuery,
    ExploreAllQueryVariables | ExploreQueryVariables
  >(processedQueryText === '' ? EXPLORE_ALL_QUERY : EXPLORE_QUERY, {
    variables: queryVariables,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: !query || query === '' ? 'no-cache' : 'cache-and-network',
  });

  return (
    <ExplorePageWrapper>
      <Helmet>
        <title>Explore Courses - UW Flow</title>
        <meta name="description" content={SEO_DESCRIPTIONS.explore} />
        <meta property="og:title" content="Explore Courses - UW Flow" />
        <meta property="og:description" content={SEO_DESCRIPTIONS.explore} />
      </Helmet>
      <ExplorePageContent
        query={query || ''}
        codeSearch={codeSearch || false}
        data={data}
        error={!!error}
        loading={loading}
      />
    </ExplorePageWrapper>
  );
};

export default ExplorePage;
