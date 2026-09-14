import { gql } from '@apollo/client';

import { SwapCourseSectionFragment } from 'graphql/queries/course/SwapCourse';

export const GET_SCHEDULE_SWAPS = gql`
  query getScheduleSwaps($userId: Int!, $termIds: [Int!]!) {
    user_schedule_swap(
      where: {
        user_id: { _eq: $userId }
        source_schedule: { section: { term_id: { _in: $termIds } } }
      }
    ) {
      user_id
      source_section_id
      replacement_section_id
      source_schedule {
        user_id
        section {
          id
          term_id
        }
      }
      replacement_section {
        ...SwapCourseSection
      }
    }
  }
  ${SwapCourseSectionFragment}
`;
