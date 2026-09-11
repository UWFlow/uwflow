import { gql } from '@apollo/client';

import CourseFragment from 'graphql/fragments/CourseFragment';
import ProfFragment from 'graphql/fragments/ProfFragment';
import ReviewFragment from 'graphql/fragments/ReviewFragment';

export const GET_COURSE = gql`
  query getCourse($code: String) {
    course(where: { code: { _eq: $code } }) {
      ...CourseInfo
      ...CourseSchedule
      ...CourseRequirements
      ...CourseRating
      ...CourseReviewDistribution
    }
  }
  ${CourseFragment.courseInfo}
  ${CourseFragment.courseSchedule}
  ${CourseFragment.courseRequirements}
  ${CourseFragment.courseRating}
  ${CourseFragment.courseReviewDistribution}
`;

export const GET_COURSE_WITH_USER_DATA = gql`
  query getCourseWithUserData($code: String, $user_id: Int) {
    course(where: { code: { _eq: $code } }) {
      ...CourseInfo
      ...CourseSchedule
      ...CourseRequirements
      ...CourseRating
      ...CourseReviewDistribution
    }
    user_shortlist(
      where: { user_id: { _eq: $user_id }, course: { code: { _eq: $code } } }
    ) {
      course_id
      user_id
    }
    user_course_taken(
      where: { course: { code: { _eq: $code } }, user_id: { _eq: $user_id } }
    ) {
      term_id
      course_id
    }
    queue_section_subscribed(
      where: {
        section: { course: { code: { _eq: $code } } }
        user_id: { _eq: $user_id }
      }
    ) {
      section_id
      user_id
    }
    review(
      where: {
        course: { code: { _eq: $code } }
        user: { user_id: { _eq: $user_id } }
      }
    ) {
      ...ReviewInfo
    }
    user {
      email
    }
  }
  ${CourseFragment.courseInfo}
  ${CourseFragment.courseSchedule}
  ${CourseFragment.courseRequirements}
  ${CourseFragment.courseRating}
  ${CourseFragment.courseReviewDistribution}
  ${ReviewFragment.reviewInfo}
`;

export const REFETCH_COURSE_SHORTLIST = gql`
  query refetchCourseShortlist($code: String, $user_id: Int) {
    user_shortlist(
      where: { user_id: { _eq: $user_id }, course: { code: { _eq: $code } } }
    ) {
      course_id
      user_id
    }
  }
`;

export const REFETCH_RATINGS = gql`
  query refetchRatings($course_id: Int, $prof_id: Int) {
    course(where: { id: { _eq: $course_id } }) {
      ...CourseRating
    }
    prof(where: { id: { _eq: $prof_id } }) {
      ...ProfRating
    }
  }
  ${CourseFragment.courseRating}
  ${ProfFragment.profRating}
`;

export const REFETCH_SECTION_SUBSCRIPTIONS = gql`
  query refetchSectionSubscriptions($course_id: Int, $user_id: Int) {
    queue_section_subscribed(
      where: {
        section: { course_id: { _eq: $course_id } }
        user_id: { _eq: $user_id }
      }
    ) {
      section_id
      user_id
    }
  }
`;

export const REFETCH_COURSE_REVIEWS = gql`
  query refetchCourseReviews($code: String, $user_id: Int) {
    review(
      where: {
        course: { code: { _eq: $code } }
        user: { user_id: { _eq: $user_id } }
      }
    ) {
      ...ReviewInfo
    }
  }
  ${ReviewFragment.reviewInfo}
`;
