import { gql } from '@apollo/client';

export const INSERT_COURSE_REVIEW_VOTE = gql`
  mutation insertCourseReviewVote($user_id: Int, $review_id: Int) {
    insert_course_review_upvote(
      objects: { review_id: $review_id, user_id: $user_id }
    ) {
      affected_rows
    }
  }
`;

export const DELETE_COURSE_REVIEW_VOTE = gql`
  mutation deleteCourseReviewVote($user_id: Int, $review_id: Int) {
    delete_course_review_upvote(
      where: { user_id: { _eq: $user_id }, review_id: { _eq: $review_id } }
    ) {
      affected_rows
    }
  }
`;

export const INSERT_PROF_REVIEW_VOTE = gql`
  mutation insertProfReviewVote($user_id: Int, $review_id: Int) {
    insert_prof_review_upvote(
      objects: { review_id: $review_id, user_id: $user_id }
    ) {
      affected_rows
    }
  }
`;

export const DELETE_PROF_REVIEW_VOTE = gql`
  mutation DELETE_PROF_REVIEW_VOTE($user_id: Int, $review_id: Int) {
    delete_prof_review_upvote(
      where: { user_id: { _eq: $user_id }, review_id: { _eq: $review_id } }
    ) {
      affected_rows
    }
  }
`;
