import { gql } from '@apollo/client';

export const SwapCourseSectionFragment = gql`
  fragment SwapCourseSection on course_section {
    id
    section_name
    class_number
    term_id
    enrollment_capacity
    enrollment_total
    updated_at
    exams {
      date
      day
      location
      start_seconds
      end_seconds
    }
    meetings {
      days
      end_date
      end_seconds
      is_cancelled
      is_tba
      location
      section_id
      start_date
      start_seconds
      prof {
        id
        code
        name
        rating {
          clear
          engaging
        }
      }
    }
    course {
      id
      name
      code
    }
  }
`;

export const GET_SECTIONS_BY_CLASS_NUMBERS = gql`
  query getSectionsByClassNumbers($classNumbers: [Int!]!, $termId: Int!) {
    course_section(
      where: { class_number: { _in: $classNumbers }, term_id: { _eq: $termId } }
    ) {
      ...SwapCourseSection
    }
  }
  ${SwapCourseSectionFragment}
`;

export const GET_COURSE_FOR_SWAP = gql`
  query getCourseForSwap($code: String!, $termId: Int!) {
    course_section(
      where: { course: { code: { _eq: $code } }, term_id: { _eq: $termId } }
      order_by: { section_name: asc }
    ) {
      ...SwapCourseSection
    }
  }
  ${SwapCourseSectionFragment}
`;

export const COURSE_DROPDOWN_TERM_QUERY = gql`
  query courseDropdownByTerm($termId: Int!) {
    course(
      where: { sections: { term_id: { _eq: $termId } } }
      order_by: { code: asc }
    ) {
      code
      name
    }
  }
`;
