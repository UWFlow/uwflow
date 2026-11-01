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
    # A merged-away prof's code shows the prof it was merged into
    prof_merge(where: { from_prof: { code: { _eq: $code } } }) {
      into_prof {
        ...ProfInfo
        ...ProfCoursesTaught
        ...ProfRating
        ...ProfReviewDistribution
      }
    }
  }
  ${ProfFragment.profInfo}
  ${ProfFragment.profCoursesTaught}
  ${ProfFragment.profRating}
  ${ProfFragment.profReviewDistribution}
`;
