import fuzzysort from 'fuzzysort';
import LZString from 'lz-string';

import { BACKEND_ENDPOINT, SEARCH_DATA_ENDPOINT } from 'constants/Api';
import {
  SearchDataCourse,
  SearchDataProf,
  SearchDataResponse,
} from 'types/Api';
import { makeGETRequest } from 'utils/Api';
import { formatCourseCode } from 'utils/Misc';

const RATING_MULTIPLIER = 0.1;
const MAX_AUTOCOMPLETE_LENGTH = 50;

export type IndexedCourse = Omit<SearchDataCourse, 'profs'> & {
  code: string;
  fullText: string;
  profs: string;
};

export type IndexedProf = Omit<SearchDataProf, 'courses'> & {
  courses: string;
};

export type IndexedCourseCode = {
  code: string;
  rating_count: number;
};

export type AutocompleteResponse = {
  courseResults: IndexedCourse[];
  profResults: IndexedProf[];
  courseCodeResults: IndexedCourseCode[];
};

type SearchResultTypes =
  | Fuzzysort.KeysResult<IndexedCourse>
  | Fuzzysort.KeysResult<IndexedProf>
  | Fuzzysort.KeyResult<IndexedCourseCode>;

const searchOptions = {
  threshold: -1000,
  allowTypo: true,
};

const courseOptions: Fuzzysort.KeysOptions<IndexedCourse> = {
  ...searchOptions,
  keys: ['fullText', 'code', 'profs'],
  scoreFn: (a) =>
    Math.max(
      a[0] ? a[0].score : -10000,
      a[1] ? a[1].score : -10000,
      a[2] ? a[2].score - 50 : -10000,
    ),
};

const profOptions: Fuzzysort.KeysOptions<IndexedProf> = {
  ...searchOptions,
  keys: ['name', 'courses'],
  scoreFn: (a) =>
    Math.max(a[0] ? a[0].score : -10000, a[1] ? a[1].score - 50 : -10000),
};

const courseCodeOptions: Fuzzysort.KeyOptions = {
  ...searchOptions,
  key: 'code',
};

const weightByRatings = <D extends SearchResultTypes>(
  results: ReadonlyArray<D>,
): D[] => {
  const clonedResults = [...results];
  return clonedResults.sort((a, b) => {
    const ratingDifference = b.obj.rating_count - a.obj.rating_count;
    return a.score === b.score
      ? ratingDifference
      : b.score - a.score + ratingDifference * RATING_MULTIPLIER;
  });
};

class SearchClient {
  courses: IndexedCourse[];

  profs: IndexedProf[];

  courseCodes: IndexedCourseCode[];

  constructor() {
    this.courses = [];
    this.profs = [];
    this.courseCodes = [];
  }

  autocomplete(query = ''): AutocompleteResponse {
    if (query.length === 0) {
      return { courseResults: [], profResults: [], courseCodeResults: [] };
    }

    if (query.length > MAX_AUTOCOMPLETE_LENGTH) {
      query = query.slice(0, MAX_AUTOCOMPLETE_LENGTH);
    }

    const parsedQuery = query
      .split(' ')
      .map((term) => formatCourseCode(term))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    const courseResults = fuzzysort.go(
      parsedQuery,
      this.courses,
      courseOptions,
    );
    const profResults = fuzzysort.go(parsedQuery, this.profs, profOptions);

    let courseCodeResults = fuzzysort.go(
      parsedQuery,
      this.courseCodes,
      courseCodeOptions,
    );

    if (courseCodeResults.length === 0) {
      courseCodeResults = fuzzysort.go(
        parsedQuery.split(' ')[0],
        this.courseCodes,
        courseCodeOptions,
      );
    }

    // Reranking by rating count
    const sortedCourses = weightByRatings(courseResults).slice(0, 4);

    const sortedProfs = weightByRatings(profResults).slice(0, 2);

    const sortedCourseCodes = weightByRatings(courseCodeResults).slice(0, 2);

    return {
      courseResults: sortedCourses.map((res) => res.obj),
      profResults: sortedProfs.map((res) => res.obj),
      courseCodeResults: sortedCourseCodes.map((res) => res.obj),
    };
  }

  async buildIndices(
    searchData: string | null,
    lastIndexedDate: Date,
  ): Promise<[string, Date]> {
    let parsedSearchData: SearchDataResponse | null = null;
    let indexedDate = lastIndexedDate;

    if (searchData !== null) {
      const decompressed = LZString.decompressFromUTF16(searchData);
      if (decompressed !== null) {
        parsedSearchData = JSON.parse(decompressed);
      }
    }

    // Fetch data if not available from local storage
    if (parsedSearchData === null) {
      [parsedSearchData] = await makeGETRequest<SearchDataResponse>(
        `${BACKEND_ENDPOINT}${SEARCH_DATA_ENDPOINT}`,
        {},
      );
      indexedDate = new Date();
    }

    // Parse data
    const courseCodeSet = new Set<string>([]);
    const courseCodeRatings: { [key: string]: number } = {};

    const courses = (parsedSearchData.courses || []).map((course) => {
      const courseLetters = formatCourseCode(course.code).split(' ')[0];
      courseCodeSet.add(courseLetters);

      // Track total number of ratings for reranking by popularity
      if (
        !Object.prototype.hasOwnProperty.call(courseCodeRatings, courseLetters)
      ) {
        courseCodeRatings[courseLetters] = 0;
      }
      courseCodeRatings[courseLetters] += course.rating_count;

      return {
        ...course,
        code: formatCourseCode(course.code),
        fullText: `${formatCourseCode(course.code)} — ${course.name}`,
        profs: course.profs === null ? '' : course.profs.join(' '),
      };
    });

    const profs = (parsedSearchData.profs || []).map((prof) => {
      return {
        ...prof,
        courses:
          prof.courses === null
            ? ''
            : prof.courses.map((course) => formatCourseCode(course)).join(' '),
      };
    });

    const courseCodes = Array.from(courseCodeSet).map((code) =>
      Object({ code, rating_count: courseCodeRatings[code] }),
    );

    // Swap old indices with new
    this.courses = courses;
    this.profs = profs;
    this.courseCodes = courseCodes;

    // Return compressed raw data for local storage
    return [
      LZString.compressToUTF16(JSON.stringify(parsedSearchData)),
      indexedDate,
    ];
  }
}

export default SearchClient;
