import { gql } from '@apollo/client';

export const UPSERT_SCHEDULE_SWAP = gql`
  mutation upsertScheduleSwap(
    $userId: Int!
    $sourceSectionId: Int!
    $replacementSectionId: Int!
  ) {
    insert_user_schedule_swap_one(
      object: {
        user_id: $userId
        source_section_id: $sourceSectionId
        replacement_section_id: $replacementSectionId
      }
      on_conflict: {
        constraint: user_schedule_swap_pkey
        update_columns: [replacement_section_id]
      }
    ) {
      user_id
      source_section_id
    }
  }
`;

export const DELETE_SCHEDULE_SWAP = gql`
  mutation deleteScheduleSwap($userId: Int!, $sourceSectionId: Int!) {
    delete_user_schedule_swap_by_pk(
      user_id: $userId
      source_section_id: $sourceSectionId
    ) {
      user_id
      source_section_id
    }
  }
`;

export const CLEAR_SCHEDULE_SWAPS = gql`
  mutation clearScheduleSwaps($userId: Int!) {
    delete_user_schedule_swap(where: { user_id: { _eq: $userId } }) {
      affected_rows
    }
  }
`;
