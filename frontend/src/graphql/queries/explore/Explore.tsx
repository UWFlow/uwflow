import { gql } from '@apollo/client';

import SearchFragment from 'graphql/fragments/SearchFragment';

export const EXPLORE_ALL_QUERY = gql`
  query exploreAll {
    course_search_index {
      ...CourseSearch
    }
    prof_search_index {
      ...ProfSearch
    }
  }
  ${SearchFragment.courseSearch}
  ${SearchFragment.profSearch}
`;

export const EXPLORE_QUERY = gql`
  query explore($query: String, $code_only: Boolean) {
    search_courses(args: { query: $query, code_only: $code_only }) {
      ...CourseSearch
    }
    search_profs(args: { query: $query, code_only: $code_only }) {
      ...ProfSearch
    }
  }
  ${SearchFragment.courseSearch}
  ${SearchFragment.profSearch}
`;
