import React from 'react';
import {
  ProfCoursesTaughtFragment,
  ProfInfoFragment,
  ProfRatingFragment,
  ProfReviewDistributionFragment,
} from 'generated/graphql';

import RatingBox, {
  RATING_BOX_HEIGHT,
  RATING_BOX_WIDTH,
} from 'components/display/RatingBox';
import { Distribution } from 'utils/Ratings';

import {
  ProfDescriptionSection,
  ProfInfoHeaderWrapper,
  ProfName,
  ProfNameSection,
  ProfNameWrapper,
  RatingsSection,
} from './styles/ProfInfoHeader';

type ProfInfoHeaderProps = {
  prof: ProfInfoFragment &
    ProfCoursesTaughtFragment &
    ProfRatingFragment &
    ProfReviewDistributionFragment;
  distributions: {
    clear: Distribution;
    engaging: Distribution;
  };
};

const ProfInfoHeader = ({ prof, distributions }: ProfInfoHeaderProps) => {
  const { liked, clear, engaging, filled_count, comment_count } =
    prof.rating || {
      liked: 0,
      clear: 0,
      engaging: 0,
      filled_count: 0,
      comment_count: 0,
    };

  return (
    <ProfInfoHeaderWrapper>
      <ProfNameSection>
        <ProfNameWrapper>
          <ProfName ratingBoxWidth={RATING_BOX_WIDTH}>{prof.name}</ProfName>
        </ProfNameWrapper>
      </ProfNameSection>
      <ProfDescriptionSection>
        <RatingsSection ratingBoxHeight={RATING_BOX_HEIGHT}>
          <RatingBox
            numRatings={filled_count}
            numComments={comment_count}
            percentages={[
              {
                displayName: 'Likes',
                percent: liked,
              },
              {
                displayName: 'Clear',
                percent: clear,
                distribution: distributions.clear,
                hasDistribution: distributions.clear.hasDistribution,
              },
              {
                displayName: 'Engaging',
                percent: engaging,
                distribution: distributions.engaging,
                hasDistribution: distributions.engaging.hasDistribution,
              },
            ]}
          />
        </RatingsSection>
      </ProfDescriptionSection>
    </ProfInfoHeaderWrapper>
  );
};

export default ProfInfoHeader;
