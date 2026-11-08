import { gql } from '@apollo/client';

import ProfFragment from 'graphql/fragments/ProfFragment';

export const GET_PROF = gql`
  query getProf($code: String) {
    prof(where: { code: { _eq: $code } }) {
      ...ProfInfo
      ...ProfCoursesTaught
      ...ProfRating
      ...ProfReviewDistribution
    }
    prof_merge(where: { from_prof: { code: { _eq: $code } } }) {
      into_prof {
        id
        code
      }
    }
  }
  ${ProfFragment.profInfo}
  ${ProfFragment.profCoursesTaught}
  ${ProfFragment.profRating}
  ${ProfFragment.profReviewDistribution}
`;
