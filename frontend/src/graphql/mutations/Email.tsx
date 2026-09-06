import { gql } from '@apollo/client';

export const UPDATE_USER_EMAIL = gql`
  mutation updateUserEmail($user_id: Int, $email: String) {
    update_user(where: { id: { _eq: $user_id } }, _set: { email: $email }) {
      affected_rows
      returning {
        id
        email
      }
    }
  }
`;
