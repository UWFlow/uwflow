import { gql } from '@apollo/client';

import ProfFragment from 'graphql/fragments/ProfFragment';
import ReviewFragment from 'graphql/fragments/ReviewFragment';

export const COURSE_REVIEWS = gql`
  query courseReviews($id: Int) {
    review(
      where: {
        course_id: { _eq: $id }
        _or: [
          { course_comment: { _is_null: false } }
          { prof_comment: { _is_null: false } }
        ]
      }
    ) {
      ...ReviewInfo
      ...ReviewVoteCounts
    }
  }
  ${ReviewFragment.reviewInfo}
  ${ReviewFragment.reviewVoteCounts}
`;

export const COURSE_REVIEWS_WITH_USER_DATA = gql`
  query courseReviewsWithUserData($id: Int) {
    review(
      where: {
        course_id: { _eq: $id }
        _or: [
          { course_comment: { _is_null: false } }
          { prof_comment: { _is_null: false } }
        ]
      }
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

export const REFETCH_COURSE_REVIEW_UPVOTE = gql`
  query refetchCourseReviewUpvote($review_id: Int) {
    review(where: { id: { _eq: $review_id } }) {
      ...ReviewVoteCounts
    }
  }
  ${ReviewFragment.reviewVoteCounts}
`;

export const COURSE_REVIEW_PROFS = gql`
  query courseReviewProfs($courseIds: [Int!]) {
    allProfs: prof(order_by: { name: asc }) {
      ...ProfInfo
    }
    reviewProfs: review(
      where: {
        course_id: { _in: $courseIds }
        prof_id: { _is_null: false }
        prof_comment: { _is_null: false }
      }
      order_by: [{ course_id: asc }, { prof_id: asc }, { id: desc }]
      distinct_on: [course_id, prof_id]
    ) {
      ...ReviewProfs
    }
  }
  ${ProfFragment.profInfo}
  ${ReviewFragment.reviewProfs}
`;
