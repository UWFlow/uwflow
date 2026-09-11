import { gql } from '@apollo/client';

import ReviewFragment from 'graphql/fragments/ReviewFragment';
import UserFragment from 'graphql/fragments/UserFragment';

// The review and course_taken fields are split up for Apollo cache performance
// When refetching data after mutating a review, the data is consistent across
// the course, prof and profile pages for fast updates
export const GET_USER = gql`
  query getUser($id: Int) {
    user(where: { id: { _eq: $id } }) {
      ...UserInfo
      ...UserShortlist
      ...UserSchedule
    }
    user_course_taken(where: { user_id: { _eq: $id } }) {
      ...UserCoursesTaken
    }
    review(where: { user: { user_id: { _eq: $id } } }) {
      ...ReviewInfo
    }
  }
  ${UserFragment.userInfo}
  ${UserFragment.userShortlist}
  ${UserFragment.userSchedule}
  ${UserFragment.userCoursesTaken}
  ${ReviewFragment.reviewInfo}
`;

export const REFETCH_USER_SHORTLIST = gql`
  query refetchUserShortlist($id: Int) {
    user(where: { id: { _eq: $id } }) {
      id
      ...UserShortlist
    }
  }
  ${UserFragment.userShortlist}
`;

export const REFETCH_USER_REVIEW = gql`
  query refetchUserReview($id: Int) {
    review(where: { user: { user_id: { _eq: $id } } }) {
      ...ReviewInfo
    }
  }
  ${ReviewFragment.reviewInfo}
`;
