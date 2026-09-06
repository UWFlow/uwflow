import React from 'react';
import { ThumbsDown, ThumbsUp } from 'react-feather';

import {
  BubbleRatingsWrapper,
  Thumb,
  ThumbsWrapper,
  UnitCircle,
} from './styles/BubbleRatings';

type ThumbsRatingsProps = {
  boolRating: boolean;
};

export const ThumbsRatings = ({ boolRating }: ThumbsRatingsProps) => (
  <BubbleRatingsWrapper>
    <ThumbsWrapper>
      <Thumb colored={boolRating === true}>
        <ThumbsUp width={20} height={20} strokeWidth={3} fill="white" />
      </Thumb>
      <Thumb colored={boolRating === false}>
        <ThumbsDown width={20} height={20} strokeWidth={3} fill="white" />
      </Thumb>
    </ThumbsWrapper>
  </BubbleRatingsWrapper>
);

type CirclesProps = {
  rating: number;
  total: number;
};

export const CircleRatings = ({ rating, total }: CirclesProps) => (
  <BubbleRatingsWrapper>
    {Array.apply(null, Array(total)).map((_, ind) => {
      return <UnitCircle key={ind} filled={ind < rating} diameter={16} />;
    })}
  </BubbleRatingsWrapper>
);
