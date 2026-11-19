import React, { useEffect, useRef, useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'react-feather';
import { useSelector } from 'react-redux';
import { useMutation } from '@apollo/client';
import moment from 'moment/moment';
import { getProfPageRoute } from 'Routes';

import { Button } from 'components/ui/button';
import { AUTH_MODAL } from 'constants/Modal';
import { getIsBrowserDesktop, RootState } from 'data/reducers/RootReducer';
import {
  DELETE_COURSE_REVIEW_DOWNVOTE,
  DELETE_COURSE_REVIEW_VOTE,
  DELETE_PROF_REVIEW_DOWNVOTE,
  DELETE_PROF_REVIEW_VOTE,
  INSERT_COURSE_REVIEW_DOWNVOTE,
  INSERT_COURSE_REVIEW_VOTE,
  INSERT_PROF_REVIEW_DOWNVOTE,
  INSERT_PROF_REVIEW_VOTE,
} from 'graphql/mutations/Upvote';
import { REFETCH_COURSE_REVIEW_UPVOTE } from 'graphql/queries/course/CourseReview';
import { REFETCH_PROF_REVIEW_UPVOTE } from 'graphql/queries/prof/ProfReview';
import useModal from 'hooks/useModal';
import { cn } from 'lib/utils';
import { getKittenFromID } from 'utils/Kitten';
import { ReviewVote } from 'utils/Review';

import {
  ProfText,
  ReviewAuthor,
  ReviewMetricsBody,
  ReviewMetricsWrapper,
  ReviewPictureAndMetricsRow,
  ReviewTextWrapper,
  ReviewWrapper,
  SingleMetricLabel,
  SingleMetricSquares,
  SingleMetricWrapper,
} from './styles/Review';
import Avatar from './Avatar';
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
  const isLoggedIn = useSelector((state: RootState) => state.auth.loggedIn);
  const isBrowserDesktop = useSelector(getIsBrowserDesktop);

  const {
    id,
    upvotes,
    downvotes,
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

  const [userVote, setUserVote] = useState<ReviewVote>(review.userVote);
  const [insertUpvote] = useMutation(
    isCourseReview ? INSERT_COURSE_REVIEW_VOTE : INSERT_PROF_REVIEW_VOTE,
    { refetchQueries },
  );
  const [deleteUpvote] = useMutation(
    isCourseReview ? DELETE_COURSE_REVIEW_VOTE : DELETE_PROF_REVIEW_VOTE,
    { refetchQueries },
  );
  const [insertDownvote] = useMutation(
    isCourseReview
      ? INSERT_COURSE_REVIEW_DOWNVOTE
      : INSERT_PROF_REVIEW_DOWNVOTE,
    { refetchQueries },
  );
  const [deleteDownvote] = useMutation(
    isCourseReview
      ? DELETE_COURSE_REVIEW_DOWNVOTE
      : DELETE_PROF_REVIEW_DOWNVOTE,
    { refetchQueries },
  );

  // Inserting a vote removes the opposite one in the database.
  const onClickVote = (vote: 'up' | 'down') => {
    if (!isLoggedIn) {
      openModal(AUTH_MODAL);
      return;
    }

    const variables = { review_id: review.id, user_id: userId };
    const [insertVote, deleteVote] =
      vote === 'up'
        ? [insertUpvote, deleteUpvote]
        : [insertDownvote, deleteDownvote];
    if (userVote === vote) {
      deleteVote({ variables });
      setUserVote(null);
    } else {
      insertVote({ variables });
      setUserVote(vote);
    }
  };

  const voteButtons = [
    {
      vote: 'up' as const,
      Icon: ThumbsUp,
      count: upvotes ?? 0,
      label: 'This review was helpful',
    },
    {
      vote: 'down' as const,
      Icon: ThumbsDown,
      count: downvotes ?? 0,
      label: 'This review was not helpful',
    },
  ];

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
        <div className="mb-xl flex items-center gap-sm tablet:mr-xl tablet:flex-col tablet:gap-0">
          <Avatar src={userImage} alt="" />
          <div className="flex gap-xs tablet:mt-sm">
            {voteButtons.map(({ vote, Icon, count, label }) => {
              const selected = userVote === vote;
              return (
                <Tooltip content={selected ? 'Remove vote' : label} key={vote}>
                  <button
                    aria-label={`${label} (${count})`}
                    aria-pressed={selected}
                    className={cn(
                      'box-border flex h-8 cursor-pointer items-center justify-center gap-xs rounded-full border-2 border-solid border-light4 bg-light1 px-sm font-inter text-sm text-dark3 hover:brightness-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      selected && 'bg-primary text-white',
                    )}
                    onClick={() => onClickVote(vote)}
                    type="button"
                  >
                    <Icon aria-hidden="true" size={14} strokeWidth={2} />
                    {count}
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>
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
