import React, { useEffect, useRef, useState } from 'react';
import { ThumbsUp } from 'react-feather';
import { useSelector } from 'react-redux';
import { useMutation } from '@apollo/client';
import moment from 'moment/moment';
import { getProfPageRoute } from 'Routes';
import { useTheme } from 'styled-components';

import { Button } from 'components/ui/button';
import { AUTH_MODAL } from 'constants/Modal';
import { getIsBrowserDesktop, RootState } from 'data/reducers/RootReducer';
import {
  DELETE_COURSE_REVIEW_VOTE,
  DELETE_PROF_REVIEW_VOTE,
  INSERT_COURSE_REVIEW_VOTE,
  INSERT_PROF_REVIEW_VOTE,
} from 'graphql/mutations/Upvote';
import { REFETCH_COURSE_REVIEW_UPVOTE } from 'graphql/queries/course/CourseReview';
import { REFETCH_PROF_REVIEW_UPVOTE } from 'graphql/queries/prof/ProfReview';
import useModal from 'hooks/useModal';
import { getKittenFromID } from 'utils/Kitten';

import {
  ProfText,
  ReviewAuthor,
  ReviewMetricsBody,
  ReviewMetricsWrapper,
  ReviewPicture,
  ReviewPictureAndMetricsRow,
  ReviewPictureAndUpvotesWrapper,
  ReviewTextWrapper,
  ReviewUpvotes,
  ReviewWrapper,
  SingleMetricLabel,
  SingleMetricSquares,
  SingleMetricWrapper,
  UpvoteNumber,
} from './styles/Review';
import { CircleRatings, ThumbsRatings } from './BubbleRatings';
import Tooltip from './Tooltip';

const MetricIfExists = (
  metrics: { [key: string]: null | undefined | boolean | number },
  metric: string,
) => {
  const metricValue = metrics[metric];
  const metricText = metric.charAt(0).toUpperCase() + metric.slice(1);

  // Don't render metric if unavailable
  if (metricValue === null || metricValue === undefined) {
    return null;
  }

  // Render boolean rating
  if (metricValue === true || metricValue === false) {
    return (
      <SingleMetricWrapper>
        <SingleMetricSquares>
          <ThumbsRatings boolRating={metricValue} />
        </SingleMetricSquares>
        <SingleMetricLabel>{metricText}</SingleMetricLabel>
      </SingleMetricWrapper>
    );
  }

  // Otherwise, render numerical rating plus 1 since they go from 0 to 4
  return (
    <SingleMetricWrapper>
      <SingleMetricSquares>
        <CircleRatings total={5} rating={Number(metrics[metric]) + 1} />
      </SingleMetricSquares>
      <SingleMetricLabel> {metricText}</SingleMetricLabel>
    </SingleMetricWrapper>
  );
};

type ReviewProps = {
  review: any;
  isCourseReview: boolean;
};

const Review = ({ review, isCourseReview }: ReviewProps) => {
  const [openModal] = useModal();
  const theme = useTheme();
  const isLoggedIn = useSelector((state: RootState) => state.auth.loggedIn);
  const isBrowserDesktop = useSelector(getIsBrowserDesktop);

  const {
    id,
    upvotes,
    upvote_users,
    review: reviewText,
    created_at,
    author,
    metrics,
    prof,
    prof_code,
    user,
  } = review;
  const userId = localStorage.getItem('user_id');

  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const reviewTextRef = useRef<HTMLDivElement>(null);

  // Skip while expanded: nothing overflows then, and the flag must stay set.
  useEffect(() => {
    const textElement = reviewTextRef.current;
    if (!textElement || expanded) {
      return;
    }
    setIsTruncated(textElement.scrollHeight > textElement.clientHeight);
  }, [reviewText, expanded, isBrowserDesktop]);

  const refetchQueries = [
    {
      query: isCourseReview
        ? REFETCH_COURSE_REVIEW_UPVOTE
        : REFETCH_PROF_REVIEW_UPVOTE,
      variables: { review_id: review.id },
    },
  ];

  const [userUpvoted, setUserUpvoted] = useState(
    upvote_users.includes(Number(userId)),
  );
  const [insertReviewVote] = useMutation(
    isCourseReview ? INSERT_COURSE_REVIEW_VOTE : INSERT_PROF_REVIEW_VOTE,
    { refetchQueries },
  );
  const [deleteReviewVote] = useMutation(
    isCourseReview ? DELETE_COURSE_REVIEW_VOTE : DELETE_PROF_REVIEW_VOTE,
    { refetchQueries },
  );

  const onClickUpvote = () => {
    if (!isLoggedIn) {
      openModal(AUTH_MODAL);
      return;
    }

    if (userUpvoted) {
      deleteReviewVote({
        variables: { review_id: review.id, user_id: userId },
      });
    } else {
      insertReviewVote({
        variables: { review_id: review.id, user_id: userId },
      });
    }
    setUserUpvoted(!userUpvoted);
  };

  const programText = author.program ? `${author.program} student ` : '';
  const authorText = author.full_name
    ? `${author.full_name}${programText.length ? ',' : ''} `
    : '';
  const authorTitle = user
    ? 'You wrote this '
    : authorText.length || programText.length
    ? `${authorText}${user ? '' : programText}`
    : 'A student ';

  let timeAgo = `${moment(created_at).fromNow()}`;
  if (moment(created_at).isBefore(moment(new Date('01-01-2012')))) {
    timeAgo = '';
  }

  const profText =
    prof && prof_code
      ? [
          ', taught by ',
          <ProfText key={prof_code} to={getProfPageRoute(prof_code)}>
            {prof}
          </ProfText>,
        ]
      : [''];

  const reviewContent = (
    <ReviewTextWrapper>
      <div
        ref={reviewTextRef}
        className={
          'whitespace-pre-line break-words text-body text-dark1 ' +
          (expanded ? '' : 'max-h-[117px] overflow-hidden')
        }
      >
        {reviewText}
      </div>
      {isTruncated && (
        <Button
          aria-expanded={expanded}
          className="mt-sm self-start"
          onClick={() => setExpanded((wasExpanded) => !wasExpanded)}
          size="inline"
          variant="link"
        >
          {expanded ? 'Show less' : 'Show more'}
        </Button>
      )}
      <ReviewAuthor>
        {`— ${authorTitle}${timeAgo}`}
        {profText}
      </ReviewAuthor>
    </ReviewTextWrapper>
  );

  const userImage = user
    ? author.picture_url
      ? author.picture_url
      : getKittenFromID(user.user_id)
    : getKittenFromID(id);

  return (
    <ReviewWrapper isUserReview={!!user}>
      <ReviewPictureAndMetricsRow>
        <ReviewPictureAndUpvotesWrapper>
          <ReviewPicture image={userImage} />
          <Tooltip
            content={userUpvoted ? `Remove vote` : `This review was helpful`}
          >
            <ReviewUpvotes
              data-for={id}
              selected={userUpvoted}
              onClick={onClickUpvote}
              onMouseDown={(e) => e.preventDefault()}
            >
              <ThumbsUp
                color={userUpvoted ? 'white' : theme.dark3}
                size={16}
                strokeWidth={2}
              />
              <UpvoteNumber selected={userUpvoted}>{upvotes || 0}</UpvoteNumber>
            </ReviewUpvotes>
          </Tooltip>
        </ReviewPictureAndUpvotesWrapper>
        {isBrowserDesktop && reviewContent}
        <ReviewMetricsWrapper>
          <ReviewMetricsBody>
            {MetricIfExists(metrics, 'clear')}
            {MetricIfExists(metrics, 'engaging')}
            {MetricIfExists(metrics, 'easy')}
            {MetricIfExists(metrics, 'useful')}
            {MetricIfExists(metrics, 'liked')}
          </ReviewMetricsBody>
        </ReviewMetricsWrapper>
      </ReviewPictureAndMetricsRow>
      {!isBrowserDesktop && reviewContent}
    </ReviewWrapper>
  );
};

export default Review;
