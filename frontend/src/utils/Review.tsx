import moment from 'moment/moment';

export const sortReviews = (reviews: any[], sortByTime: boolean): any[] => {
  return reviews.sort((a, b): any => {
    if (b.user) {
      return 1;
    }
    if (a.user) {
      return -1;
    }

    const timeDiff = moment(b.created_at).diff(moment(a.created_at));
    if (timeDiff === 0) {
      return b.upvotes - a.upvotes;
    }
    if (b.upvotes === a.upvotes) {
      return timeDiff;
    }

    return sortByTime ? timeDiff : b.upvotes - a.upvotes;
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
