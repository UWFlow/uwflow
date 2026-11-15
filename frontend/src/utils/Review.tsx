import moment from 'moment/moment';

export type ReviewVote = 'up' | 'down' | null;

// Hasura returns only the signed-in user's own vote rows.
export const getUserVote = (
  upvotes?: unknown[],
  downvotes?: unknown[],
): ReviewVote => (upvotes?.length ? 'up' : downvotes?.length ? 'down' : null);

const getScore = (review: any): number => review.upvotes - review.downvotes;

export const sortReviews = (reviews: any[], sortByTime: boolean): any[] => {
  return reviews.sort((a, b): any => {
    if (b.user) {
      return 1;
    }
    if (a.user) {
      return -1;
    }

    const timeDiff = moment(b.created_at).diff(moment(a.created_at));
    const scoreDiff = getScore(b) - getScore(a);
    if (timeDiff === 0) {
      return scoreDiff;
    }
    if (scoreDiff === 0) {
      return timeDiff;
    }

    return sortByTime ? timeDiff : scoreDiff;
  });
};

// used to sort profs on course prof reviews and also sort courses on prof page
export const sortByReviews = (
  a_reviews: any,
  b_reviews: any,
  defaultSort: (a: any, b: any) => number = () => 0,
) =>
  a_reviews.reviews.length === b_reviews.reviews.length
    ? defaultSort(a_reviews, b_reviews)
    : b_reviews.reviews.length - a_reviews.reviews.length;

export const sortByLiked = (a: any, b: any, defaultSort = sortByReviews) =>
  a.liked === b.liked
    ? defaultSort(a, b)
    : a.liked === null
    ? 1
    : b.liked === null
    ? -1
    : b.liked - a.liked;
