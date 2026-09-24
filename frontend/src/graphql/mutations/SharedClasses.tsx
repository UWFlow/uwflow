import { gql } from '@apollo/client';

export const CREATE_SHARED_GROUP = gql`
  mutation createSharedGroup($name: String!) {
    insert_shared_group_one(
      object: { name: $name, members: { data: [{ status: "member" }] } }
    ) {
      id
      name
    }
  }
`;

export const ACCEPT_SHARED_GROUP_INVITE = gql`
  mutation acceptSharedGroupInvite($groupId: Int!) {
    update_shared_group_member(
      where: { group_id: { _eq: $groupId } }
      _set: { status: "member" }
    ) {
      affected_rows
    }
  }
`;

export const REMOVE_SHARED_GROUP_MEMBERSHIP = gql`
  mutation removeSharedGroupMembership($groupId: Int!) {
    delete_shared_group_member(where: { group_id: { _eq: $groupId } }) {
      affected_rows
    }
  }
`;

export const DELETE_SHARED_GROUP = gql`
  mutation deleteSharedGroup($groupId: Int!) {
    delete_shared_group(where: { id: { _eq: $groupId } }) {
      affected_rows
    }
  }
`;
