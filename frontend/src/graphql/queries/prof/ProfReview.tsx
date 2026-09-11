import { gql } from '@apollo/client';

import ReviewFragment from 'graphql/fragments/ReviewFragment';

export const PROF_REVIEWS = gql`
  query profReviews($id: Int) {
    review(
      where: { prof_id: { _eq: $id }, prof_comment: { _is_null: false } }
    ) {
      ...ReviewInfo
      ...ReviewVoteCounts
    }
  }
  ${ReviewFragment.reviewInfo}
  ${ReviewFragment.reviewVoteCounts}
`;

export const PROF_REVIEWS_WITH_USER_DATA = gql`
  query profReviewsWithUserData($id: Int) {
    review(
      where: { prof_id: { _eq: $id }, prof_comment: { _is_null: false } }
    ) {
      ...ReviewInfo
      ...ReviewVoteCounts
      ...UserReviewFields
    }
  }
  ${ReviewFragment.reviewInfo}
  ${ReviewFragment.reviewVoteCounts}
  ${ReviewFragment.userReviewFields}
`;

export const REFETCH_PROF_REVIEW_UPVOTE = gql`
  query REFETCH_PROF_REVIEW_UPVOTE($review_id: Int) {
    review(where: { id: { _eq: $review_id } }) {
      ...ReviewVoteCounts
    }
  }
  ${ReviewFragment.reviewVoteCounts}
`;
