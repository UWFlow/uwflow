import React, { useEffect, useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'react-feather';
import { useSelector } from 'react-redux';
import { useMutation } from '@apollo/client';
import { useTheme } from 'styled-components';

import { AUTH_MODAL } from 'constants/Modal';
import { RootState } from 'data/reducers/RootReducer';
import { UPSERT_LIKED_REVIEW } from 'graphql/mutations/Review';
import {
  REFETCH_COURSE_REVIEWS,
  REFETCH_RATINGS,
} from 'graphql/queries/course/Course';
import { COURSE_REVIEWS_WITH_USER_DATA } from 'graphql/queries/course/CourseReview';
import { REFETCH_USER_REVIEW } from 'graphql/queries/user/User';
import useModal from 'hooks/useModal';
import { capture } from 'lib/analytics';
import { getUserId } from 'utils/Auth';

import {
  LikeCourseToggleButton,
  LikeCourseToggleWrapper,
} from './styles/LikeCourseToggle';

type LikeCourseToggleProps = {
  courseId: number;
  courseCode: string;
  initialState?: number | null;
  profId?: number | null;
  reviewId?: number | null;
};

const LikeCourseToggle = ({
  courseId,
  courseCode,
  reviewId = null,
  initialState = null,
  profId = null,
}: LikeCourseToggleProps) => {
  const [openModal] = useModal();
  const theme = useTheme();
  const isLoggedIn = useSelector((state: RootState) => state.auth.loggedIn);
  const userId = getUserId();

  const refetchQueries = [
    {
      query: REFETCH_RATINGS,
      variables: {
        course_id: courseId,
        prof_id: profId === null ? -1 : profId,
      },
    },
    {
      query: REFETCH_COURSE_REVIEWS,
      variables: {
        code: courseCode,
        user_id: userId,
      },
    },
    {
      query: COURSE_REVIEWS_WITH_USER_DATA,
      variables: {
        id: courseId,
      },
    },
    {
      query: REFETCH_USER_REVIEW,
      variables: {
        id: userId,
      },
    },
  ];
  const [liked, setLiked] = useState(initialState);
  const [upsertLiked] = useMutation(UPSERT_LIKED_REVIEW, { refetchQueries });

  useEffect(() => setLiked(initialState), [initialState]);

  const toggleOnClick = (targetState: number) => {
    if (!isLoggedIn) {
      openModal(AUTH_MODAL);
      return;
    }

    if (!courseId) {
      return;
    }

    const likedValue = liked === targetState ? null : targetState;
    setLiked(likedValue);

    // Toggling off clears the like — that's a removal, not a posted review.
    if (likedValue !== null) {
      capture('review_posted', {
        review_type: 'like',
        about_prof: false,
        course_id: courseId,
        course_code: courseCode,
        liked: likedValue,
      });
    }

    upsertLiked({
      variables: { user_id: userId, course_id: courseId, liked: likedValue },
      optimisticResponse: {
        __typename: 'mutation_root',
        insert_review: {
          __typename: 'review_mutation_response',
          returning: {
            __typename: 'review',
            id: reviewId,
            liked: likedValue,
          },
        },
      },
    });
  };

  return (
    <LikeCourseToggleWrapper>
      <LikeCourseToggleButton
        left
        noneSelected={liked === null}
        selected={liked === 1}
        onClick={() => toggleOnClick(1)}
        onMouseDown={(e) => e.preventDefault()}
      >
        <ThumbsUp
          color={liked === 1 ? theme.white : theme.dark3}
          size={16}
          strokeWidth={3}
        />
      </LikeCourseToggleButton>
      <LikeCourseToggleButton
        left={false}
        noneSelected={liked === null}
        selected={liked === 0}
        onClick={() => toggleOnClick(0)}
        onMouseDown={(e) => e.preventDefault()}
      >
        <ThumbsDown
          color={liked === 0 ? theme.white : theme.dark3}
          size={16}
          strokeWidth={3}
        />
      </LikeCourseToggleButton>
    </LikeCourseToggleWrapper>
  );
};

export default LikeCourseToggle;
