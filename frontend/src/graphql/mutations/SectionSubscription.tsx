import { gql } from '@apollo/client';

export const INSERT_SECTION_SUBSCRIPTION = gql`
  mutation insertSectionSubscription($section_id: Int, $user_id: Int) {
    insert_queue_section_subscribed(
      objects: { section_id: $section_id, user_id: $user_id }
    ) {
      affected_rows
    }
  }
`;

export const DELETE_SECTION_SUBSCRIPTION = gql`
  mutation deleteSectionSubscription($section_id: Int) {
    delete_queue_section_subscribed(
      where: { section_id: { _eq: $section_id } }
    ) {
      affected_rows
    }
  }
`;
