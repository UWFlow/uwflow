import { gql } from '@apollo/client';

const CourseFragment = {
  courseInfo: gql`
    fragment CourseInfo on course {
      id
      code
      name
      description
      profs_teaching {
        prof {
          id
          code
          name
          rating {
            liked
            comment_count
          }
        }
      }
    }
  `,
  courseTerm: gql`
    fragment CourseTerm on course {
      id
      sections {
        id
        term_id
      }
    }
  `,
  courseSchedule: gql`
    fragment CourseSchedule on course {
      id
      sections {
        id
        enrollment_capacity
        enrollment_total
        class_number
        section_name
        term_id
        updated_at
        meetings {
          days
          start_date
          end_date
          start_seconds
          end_seconds
          location
          prof {
            id
            code
            name
          }
          is_closed
          is_cancelled
          is_tba
        }
        exams {
          date
          day
          end_seconds
          is_tba
          location
          section_id
          start_seconds
        }
      }
    }
  `,
  courseRequirements: gql`
    fragment CourseRequirements on course {
      id
      antireqs
      prereqs
      coreqs
      postrequisites {
        postrequisite {
          id
          code
          name
        }
      }
    }
  `,
  courseRating: gql`
    fragment CourseRating on course {
      id
      rating {
        liked
        easy
        useful
        filled_count
        comment_count
      }
    }
  `,
  courseReviewDistribution: gql`
    fragment CourseReviewDistribution on course {
      id
      course_useful_buckets {
        value
        count
      }
      course_easy_buckets {
        value
        count
      }
    }
  `,
};

export default CourseFragment;
