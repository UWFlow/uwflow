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
  }
  ${ProfFragment.profInfo}
  ${ProfFragment.profCoursesTaught}
  ${ProfFragment.profRating}
  ${ProfFragment.profReviewDistribution}
`;
