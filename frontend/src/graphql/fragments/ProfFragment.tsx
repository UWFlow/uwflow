import { gql } from '@apollo/client';

const ProfFragment = {
  profInfo: gql`
    fragment ProfInfo on prof {
      id
      name
      code
    }
  `,
  profCoursesTaught: gql`
    fragment ProfCoursesTaught on prof {
      id
      prof_courses {
        course {
          id
          code
        }
      }
    }
  `,
  profRating: gql`
    fragment ProfRating on prof {
      id
      rating {
        liked
        clear
        engaging
        filled_count
        comment_count
      }
    }
  `,
  profReviewDistribution: gql`
    fragment ProfReviewDistribution on prof {
      id
      prof_engaging_buckets {
        value
        count
      }
      prof_clear_buckets {
        value
        count
      }
    }
  `,
};

export default ProfFragment;
