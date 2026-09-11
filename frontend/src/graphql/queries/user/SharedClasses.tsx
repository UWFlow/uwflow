import { gql } from '@apollo/client';

export const GET_SHARED_GROUPS = gql`
  query getSharedGroups($userId: Int!) {
    shared_group(order_by: { created_at: desc }) {
      id
      name
      membership: members(where: { user_id: { _eq: $userId } }, limit: 1) {
        status
      }
      members_aggregate(where: { status: { _eq: "member" } }) {
        aggregate {
          count
        }
      }
    }
  }
`;
