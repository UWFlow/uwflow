import { gql } from '@apollo/client';

import ReviewFragment from 'graphql/fragments/ReviewFragment';

export const UPSERT_REVIEW = gql`
  mutation upsertReview(
    $user_id: Int
    $course_id: Int
    $prof_id: Int
    $liked: smallint
    $public: Boolean
    $course_easy: smallint
    $course_useful: smallint
    $course_comment: String
    $prof_clear: smallint
    $prof_engaging: smallint
    $prof_comment: String
  ) {
    insert_review(
      objects: {
        user_id: $user_id
        course_id: $course_id
        prof_id: $prof_id
        liked: $liked
        public: $public
        course_easy: $course_easy
        course_useful: $course_useful
        course_comment: $course_comment
        prof_clear: $prof_clear
        prof_engaging: $prof_engaging
        prof_comment: $prof_comment
      }
      on_conflict: {
        constraint: course_uniquely_reviewed
        update_columns: [
          prof_id
          liked
          course_easy
          course_useful
          course_comment
          prof_clear
          prof_engaging
          prof_comment
          public
        ]
      }
    ) {
      returning {
        ...ReviewUpdateInfo
      }
    }
  }
  ${ReviewFragment.reviewUpdateInfo}
`;

export const DELETE_REVIEW = gql`
  mutation deleteReview($review_id: Int) {
    delete_review(where: { id: { _eq: $review_id } }) {
      returning {
        ...ReviewUpdateInfo
      }
    }
  }
  ${ReviewFragment.reviewUpdateInfo}
`;

export const UPSERT_LIKED_REVIEW = gql`
  mutation upsertLikedReview($user_id: Int, $course_id: Int, $liked: smallint) {
    insert_review(
      objects: {
        user_id: $user_id
        course_id: $course_id
        liked: $liked
        public: false
      }
      on_conflict: {
        constraint: course_uniquely_reviewed
        update_columns: [liked]
      }
    ) {
      returning {
        id
        liked
      }
    }
  }
`;
