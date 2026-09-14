import { useState } from 'react';
import {
  CourseReviewsQuery,
  CourseReviewsWithUserDataQuery,
} from 'generated/graphql';

export const UPDATE_REVIEW_DATA = 'update_review_data';

export type CourseReviewsAction = {
  type: typeof UPDATE_REVIEW_DATA;
  payload: CourseReviewsQuery | CourseReviewsWithUserDataQuery;
};

export type CourseReviewsState = {
  courseReviews: any[];
  reviewsByProf: any[];
  courseReviewProfs: string[];
  profReviewProfs: string[];
};

const getReviewsByCourse = (data: any): any[] =>
  data.review
    .filter((r: any) => r.course_comment)
    .map((r: any) => ({
      id: r.id,
      upvotes: r.course_review_rating ? r.course_review_rating.upvote_count : 0,
      review: r.course_comment,
      author: r.author,
      created_at: r.created_at,
      updated_at: r.updated_at,
      metrics: {
        useful: r.course_useful,
        easy: r.course_easy,
        liked: r.liked === 1 ? true : r.liked === 0 ? false : null,
      },
      prof: r.prof ? r.prof.name : '',
      prof_code: r.prof ? r.prof.code : '',
      upvote_users: r.course_review_upvotes
        ? r.course_review_upvotes.map((vote: any) => Number(vote.user_id))
        : [],
      user: r.user,
    }));

const getReviewsByProf = (data: any): any[] =>
  data.review.reduce((allProfs: any[], current: any) => {
    let profObject;
    let foundProfObject = false;

    if (!current.prof || !current.prof_comment) {
      return allProfs;
    }

    for (const i of allProfs) {
      if (current.prof && current.prof.name === i.name) {
        profObject = i;
        foundProfObject = true;
        break;
      }
    }
    if (!foundProfObject) {
      profObject = {
        id: current.prof ? current.prof.id : 0,
        code: current.prof ? current.prof.code : '',
        name: current.prof ? current.prof.name : '',
        liked:
          current.prof && current.prof.rating
            ? current.prof.rating.liked
            : null,
        reviews: [],
      };
      allProfs.push(profObject);
    }
    profObject.reviews.push({
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
    return allProfs;
  }, []);

const getCourseReviewProfs = (data: any): string[] =>
  data.review.reduce((allProfs: any[], review: any) => {
    if (review.prof && !allProfs.includes(review.prof.name)) {
      allProfs.push(review.prof.name);
    }
    return allProfs;
  }, []);

const getProfReviewProfs = (reviewsByProf: any): string[] =>
  reviewsByProf.map((obj: any) => obj.name);

const useCourseReviews = (): [
  CourseReviewsState,
  (action: CourseReviewsAction) => void,
] => {
  const [state, setState] = useState<CourseReviewsState>({
    courseReviews: [],
    reviewsByProf: [],
    courseReviewProfs: [],
    profReviewProfs: [],
  });

  const convertInputToState = (data: any): CourseReviewsState => {
    const courseReviews = getReviewsByCourse(data);
    const reviewsByProf = getReviewsByProf(data);
    return {
      courseReviews,
      reviewsByProf,
      courseReviewProfs: getCourseReviewProfs(data),
      profReviewProfs: getProfReviewProfs(reviewsByProf),
    };
  };

  const processDispatch = (
    currentState: CourseReviewsState,
    action: CourseReviewsAction,
  ) => {
    switch (action.type) {
      case UPDATE_REVIEW_DATA:
        return convertInputToState(action.payload);
      default:
        return currentState;
    }
  };

  const dispatch = (action: CourseReviewsAction) => {
    const newState = processDispatch(state, action);
    setState(newState);
  };

  return [state, dispatch];
};

export default useCourseReviews;
