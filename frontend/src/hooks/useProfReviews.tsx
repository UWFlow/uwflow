import { useState } from 'react';
import {
  ProfReviewsQuery,
  ProfReviewsWithUserDataQuery,
} from 'generated/graphql';

export const UPDATE_REVIEW_DATA = 'update review data';

export type ProfReviewsAction = {
  type: typeof UPDATE_REVIEW_DATA;
  payload: ProfReviewsQuery | ProfReviewsWithUserDataQuery;
};

export type ProfReviewsState = {
  reviewsByCourse: any[];
  courses: string[];
};

const getReviewsByCourse = (data: any): any[] =>
  data.review.reduce((allCourses: any[], current: any) => {
    let courseObject;
    let foundCourseObject = false;
    for (const i of allCourses) {
      if (current.course && current.course.id === i.id) {
        courseObject = i;
        foundCourseObject = true;
        break;
      }
    }
    if (!foundCourseObject) {
      courseObject = {
        id: current.course ? current.course.id : -1,
        name: current.course ? current.course.name : '',
        code: current.course ? current.course.code : '',
        liked:
          current.course && current.course.rating
            ? current.course.rating.liked
            : null,
        reviews: [],
      };
      allCourses.push(courseObject);
    }
    courseObject.reviews.push({
      id: current.id,
      upvotes: current.prof_review_rating
        ? current.prof_review_rating.upvote_count
        : 0,
      upvote_users: current.prof_review_upvotes
        ? current.prof_review_upvotes.map((vote: any) => Number(vote.user_id))
        : [],
      review: current.prof_comment,
      author: current.author,
      user: current.user,
      created_at: current.created_at,
      updated_at: current.updated_at,
      metrics: {
        clear: current.prof_clear,
        engaging: current.prof_engaging,
      },
    });

    return allCourses;
  }, []);

const getCourses = (reviewsByCourse: any[]): string[] =>
  reviewsByCourse.map((obj) => obj.code);

const useProfReviews = (): [
  ProfReviewsState,
  (action: ProfReviewsAction) => void,
] => {
  const [state, setState] = useState<ProfReviewsState>({
    reviewsByCourse: [],
    courses: [],
  });

  const convertInputToState = (data: any): ProfReviewsState => {
    const reviewsByCourse = getReviewsByCourse(data);
    return {
      reviewsByCourse,
      courses: getCourses(reviewsByCourse),
    };
  };

  const processDispatch = (
    currentState: ProfReviewsState,
    action: ProfReviewsAction,
  ) => {
    switch (action.type) {
      case UPDATE_REVIEW_DATA:
        return convertInputToState(action.payload);
      default:
        return currentState;
    }
  };

  const dispatch = (action: ProfReviewsAction) => {
    const newState = processDispatch(state, action);
    setState(newState);
  };

  return [state, dispatch];
};

export default useProfReviews;
