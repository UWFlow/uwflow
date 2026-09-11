import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ExploreAllQuery, ExploreQuery } from 'generated/graphql';

import TabContainer from 'components/display/TabContainer';
import Table from 'components/display/Table';
import { EXPLORE_COURSES_ERROR } from 'constants/Messages';
import { SEARCH_RESULTS_PER_PAGE } from 'constants/Search';
import {
  CourseSearchResult,
  ProfSearchResult,
  SearchFilterState,
  TableSortBy,
} from 'types/Common';
import { getCurrentTermCode, getNextTermCode } from 'utils/Misc';

import { ResultsError, SearchResultsContent } from './styles/SearchResults';
import { courseColumns, profColumns } from './ExploreTableData';
import { RATING_MULTIPLES } from './RatingSlider';

const currentTermCode = getCurrentTermCode();
const nextTermCode = getNextTermCode();

// Default sort applied when the URL has no `sortBy` filter; the empty
// string and this value are treated as equivalent so the default never
// dirties the URL.
const DEFAULT_SORT_BY: TableSortBy = { id: 'ratings', desc: false };

// 'name' -> asc, '-name' -> desc, '' -> default sort.
const parseSortBy = (sortBy: string): TableSortBy[] => {
  if (!sortBy) return [DEFAULT_SORT_BY];
  const desc = sortBy.startsWith('-');
  return [{ id: desc ? sortBy.slice(1) : sortBy, desc }];
};

// Inverse of parseSortBy. Returns '' for the default sort so the URL
// stays clean while the table still renders sorted on first load.
const formatSortBy = (sortBy: TableSortBy[]): string => {
  if (sortBy.length === 0) return '';
  const { id, desc } = sortBy[0];
  if (id === DEFAULT_SORT_BY.id && desc === DEFAULT_SORT_BY.desc) return '';
  return desc ? `-${id}` : id;
};

type SortValue = string | number | null;
type SortValueGetter = (row: any) => SortValue;

const courseSortValue: Record<string, SortValueGetter> = {
  code: (c) => c.code,
  name: (c) => c.name,
  ratings: (c) => c.ratings,
  useful: (c) => c.useful,
  easy: (c) => c.easy,
  liked: (c) => c.liked,
};

const profSortValue: Record<string, SortValueGetter> = {
  code_name: (p) => p.code_name?.name ?? null,
  ratings: (p) => p.ratings,
  clear: (p) => p.clear,
  engaging: (p) => p.engaging,
  liked: (p) => p.liked,
};

const compare = (a: SortValue, b: SortValue, desc: boolean): number => {
  if (a === null || b === null) {
    if (a === b) return 0;
    return a === null ? 1 : -1;
  }
  if (typeof a === 'string' && typeof b === 'string') {
    return desc ? b.localeCompare(a) : a.localeCompare(b);
  }
  return desc ? (a as number) - (b as number) : (b as number) - (a as number);
};

type SearchResultsProps = {
  filterState: SearchFilterState;
  setFilterState: Dispatch<SetStateAction<SearchFilterState>>;
  error: boolean;
  exploreTab: number;
  setExploreTab: (tab: number) => void;
  profCourses: string[];
  loading: boolean;
  exploreAll: boolean;
  data?: ExploreAllQuery | ExploreQuery;
};

const SearchResults = ({
  filterState,
  setFilterState,
  data,
  error,
  exploreTab,
  setExploreTab,
  profCourses,
  loading,
  exploreAll,
}: SearchResultsProps) => {
  const [numRendered, setNumRendered] = useState(SEARCH_RESULTS_PER_PAGE);
  const [courses, setCourses] = useState<CourseSearchResult[] | null>(null);
  const [profs, setProfs] = useState<ProfSearchResult[] | null>(null);

  // Table sort lives in filterState so it can be shared with the URL.
  const tableSortBy = parseSortBy(filterState.sortBy);

  useEffect(() => {
    setNumRendered(SEARCH_RESULTS_PER_PAGE);
  }, [exploreTab]);

  useEffect(() => {
    if (data === undefined) {
      return;
    }

    const allCourses = exploreAll
      ? (data as ExploreAllQuery).course_search_index
      : (data as ExploreQuery).search_courses;

    const allProfs = exploreAll
      ? (data as ExploreAllQuery).prof_search_index
      : (data as ExploreQuery).search_profs;

    const newCourses: CourseSearchResult[] = allCourses.map((result) => ({
      id: result.course_id ?? 0,
      code: result.code ?? '',
      name: result.name ?? '',
      ratings: result.ratings,
      liked: result.liked,
      easy: result.easy,
      useful: result.useful,
      terms: result.terms,
      terms_with_seats: result.terms_with_seats,
      has_prereqs: result.has_prereqs ? result.has_prereqs?.valueOf() : false,
      terms_with_online_section: result.terms_with_online_sections,
    }));

    const newProfs: ProfSearchResult[] = allProfs.map((result) => ({
      id: result.prof_id ?? 0,
      code_name: {
        code: result.code ?? '',
        name: result.name ?? '',
      },
      ratings: result.ratings,
      liked: result.liked,
      clear: result.clear,
      engaging: result.engaging,
      courses: new Set<string>(result.course_codes),
    }));

    setCourses(newCourses);
    setProfs(newProfs);
  }, [data, exploreAll]);

  const courseCodeRegex = useMemo(() => {
    let regexStr = '';
    for (let i = filterState.courseCodes.length - 1; i >= 0; i -= 1) {
      if (filterState.courseCodes[i]) {
        regexStr += `|${
          i < filterState.courseCodes.length - 1 ? i + 1 : '[5-8]'
        }`;
      }
    }
    regexStr =
      regexStr === '' ? 'a^' : `[a-z|A-Z]+(${regexStr.slice(1)})([0-9]*)`;
    return new RegExp(regexStr);
  }, [filterState]);

  const filteredCourses = courses
    ? courses.filter((course) => {
        // The seats/online filters only apply to the selected term; if both
        // term filters are on, the current term takes priority.
        const requiredTermCode = filterState.currentTerm
          ? currentTermCode
          : filterState.nextTerm
          ? nextTermCode
          : null;

        const offeredInRequiredTerm = (terms: number[]) =>
          requiredTermCode === null || terms.includes(requiredTermCode);

        // Course code matches one of the selected levels (e.g. 1XX, 2XX)
        const matchesCodePattern = courseCodeRegex.test(course.code);

        // Meets the minimum number of ratings
        const meetsRatingThreshold =
          course.ratings >= RATING_MULTIPLES[filterState.numCourseRatings];

        // Offered in the term(s) the user asked for
        const isOfferedInCurrentTerm =
          !filterState.currentTerm || course.terms.includes(currentTermCode);

        const isOfferedInNextTerm =
          !filterState.nextTerm || course.terms.includes(nextTermCode);

        // Has open seats / an online section in the selected term
        const hasSeatsAvailable =
          !filterState.hasRoomAvailable ||
          offeredInRequiredTerm(course.terms_with_seats);

        const hasOnlineSection =
          !filterState.hasOnlineSection ||
          offeredInRequiredTerm(course.terms_with_online_section);

        // A course is shown only if it passes every active filter
        return (
          matchesCodePattern &&
          meetsRatingThreshold &&
          isOfferedInCurrentTerm &&
          isOfferedInNextTerm &&
          hasSeatsAvailable &&
          hasOnlineSection
        );
      })
    : [];

  const filteredProfs = profs
    ? profs.filter(
        (prof) =>
          prof.ratings >= RATING_MULTIPLES[filterState.numProfRatings] &&
          prof.code_name.code &&
          (filterState.courseTaught === 0 ||
            prof.courses.has(profCourses[filterState.courseTaught])),
      )
    : [];

  const courseSearch = exploreTab === 0;

  const resultsToReturn = useMemo(() => {
    const rows = courseSearch ? filteredCourses : filteredProfs;
    const sort = tableSortBy[0];
    const getValue = sort
      ? (courseSearch ? courseSortValue : profSortValue)[sort.id]
      : undefined;

    if (!getValue || !sort) return rows;

    return [...rows].sort((a: any, b: any) =>
      compare(getValue(a), getValue(b), sort.desc),
    );
  }, [courseSearch, filteredCourses, filteredProfs, tableSortBy]);

  const tableProps = {
    cellPadding: '16px 0',
    loading: loading || courses === null || profs === null,
    sortable: true,
    manualSortBy: true,
    setTableState: (state: any) => {
      const nextSortBy = formatSortBy((state.sortBy || []) as TableSortBy[]);
      if (nextSortBy === filterState.sortBy) return;
      setNumRendered(50);
      setFilterState((prev) => ({ ...prev, sortBy: nextSortBy }));
    },
  };

  const doneFetching =
    courses !== null && profs !== null
      ? courseSearch
        ? filteredCourses.length <= numRendered
        : filteredProfs.length <= numRendered
      : !!error;

  const results = () => (
    <SearchResultsContent>
      <Table
        {...tableProps}
        data={resultsToReturn.slice(0, numRendered)}
        columns={courseSearch ? courseColumns : profColumns}
        showNoResults
        fetchMore={() =>
          setNumRendered(
            Math.min(
              numRendered + 50,
              courseSearch ? filteredCourses.length : filteredProfs.length,
            ),
          )
        }
        initialState={{ sortBy: tableSortBy }}
        doneFetching={doneFetching}
      />
    </SearchResultsContent>
  );

  return (
    <>
      <TabContainer
        tabList={[
          {
            onClick: () => setExploreTab(0),
            title: `Courses ${courses ? `(${filteredCourses.length})` : ''}`,
            render: results,
          },
          {
            onClick: () => setExploreTab(1),
            title: `Profs ${profs ? `(${filteredProfs.length})` : ''}`,
            render: results,
          },
        ]}
        initialSelectedTab={exploreTab}
        contentPadding="0"
      />
      {error && <ResultsError>{EXPLORE_COURSES_ERROR}</ResultsError>}
    </>
  );
};

export default SearchResults;
