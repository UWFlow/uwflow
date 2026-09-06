import { gql } from '@apollo/client';

const ReviewFragment = {
  reviewInfo: gql`
    fragment ReviewInfo on review {
      id
      created_at
      updated_at
      public
      liked
      course_comment
      course_easy
      course_useful
      prof_engaging
      prof_comment
      prof_clear
      author {
        full_name
        picture_url
        program
      }
      course_id
      course {
        id
        code
        name
        profs_teaching {
          prof {
            id
            name
          }
        }
        rating {
          liked
        }
      }
      prof_id
      prof {
        id
        name
        code
        picture_url
        rating {
          liked
        }
      }
    }
  `,
  reviewUpdateInfo: gql`
    fragment ReviewUpdateInfo on review {
      id
      created_at
      updated_at
      public
      liked
      course_comment
      course_easy
      course_useful
      prof_engaging
      prof_comment
      prof_clear
      course_id
      prof_id
    }
  `,
  reviewVoteCounts: gql`
    fragment ReviewVoteCounts on review {
      id
      course_review_rating {
        upvote_count
      }
      prof_review_rating {
        upvote_count
      }
    }
  `,
  userReviewFields: gql`
    fragment UserReviewFields on review {
      id
      course_review_upvotes {
        user_id
      }
      prof_review_upvotes {
        user_id
      }
      user {
        user_id
      }
    }
  `,
  reviewProfs: gql`
    fragment ReviewProfs on review {
      id
      prof {
        id
        name
        code
      }
      course_id
    }
  `,
};

export default ReviewFragment;
