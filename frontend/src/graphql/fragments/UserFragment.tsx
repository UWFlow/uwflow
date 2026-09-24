import { gql } from '@apollo/client';

const UserFragment = {
  userInfo: gql`
    fragment UserInfo on user {
      id
      full_name
      program
      picture_url
      secret_id
      email
    }
  `,
  userShortlist: gql`
    fragment UserShortlist on user {
      id
      shortlist {
        course_id
        user_id
        course {
          id
          code
          name
        }
      }
    }
  `,
  userSchedule: gql`
    fragment UserSchedule on user {
      id
      schedule {
        user_id
        section {
          id
          class_number
          term_id
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
            location
            prof {
              id
              name
            }
            section_id
            start_date
            start_seconds
          }
          section_name
          course {
            id
            name
            code
          }
        }
      }
    }
  `,
  userCoursesTaken: gql`
    fragment UserCoursesTaken on user_course_taken {
      term_id
      course_id
      course {
        id
        code
        name
        rating {
          liked
        }
        profs_teaching {
          prof {
            id
            code
            name
          }
        }
        sections {
          id
          term_id
          updated_at
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
    }
  `,
};

export default UserFragment;
