import { gql } from '@apollo/client';

export const INSERT_USER_SHORTLIST = gql`
  mutation insertUserShortlist($user_id: Int, $course_id: Int) {
    insert_user_shortlist(
      objects: { course_id: $course_id, user_id: $user_id }
    ) {
      affected_rows
    }
  }
`;

export const DELETE_USER_SHORTLIST = gql`
  mutation deleteUserShortlist($course_id: Int) {
    delete_user_shortlist(where: { course_id: { _eq: $course_id } }) {
      affected_rows
    }
  }
`;
