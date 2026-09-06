import React from 'react';
import { BarChart2 } from 'react-feather';
import { useSelector } from 'react-redux';
import { useTheme } from 'styled-components';

import ProgressBar from 'components/display/ProgressBar';
import CircularPercentage from 'components/statistics/CircularPercentage';
import { REVIEWS_DIV_ID } from 'constants/PageConstants';
import { getIsBrowserDesktop, RootState } from 'data/reducers/RootReducer';
import { processRating } from 'utils/Misc';

import {
  CircularPercentageWrapper,
  DistributionIcon,
  NumCommentsAndRatingsWrapper,
  NumCommentsWrapper,
  NumRatingsWrapper,
  ProgressBarWrapper,
  ProgressLabel,
  ProgressNumberLabel,
  ProgressTextLabel,
  ProgressWrapper,
  RatingBarsColumn,
  RatingBoxWrapper,
  ReviewsAndGraphButtonWrapper,
} from './styles/RatingBox';
import Popover from './Popover';
import RatingDistributionGraph from './RatingDistributionGraph';

export const RATING_BOX_HEIGHT = 244;
export const RATING_BOX_WIDTH = 512;

type Distribution = {
  displayName: string;
  buckets: Array<{
    value: number;
    count: number;
  }>;
  total: number;
};

/*
  Data for "liked" must be the first element in percentages
*/
type RatingBoxProps = {
  percentages: {
    displayName: string;
    percent: number;
    hasDistribution?: boolean;
    distribution?: Distribution;
  }[];
  numRatings: number;
  numComments: number;
};

const RatingBox = ({
  percentages,
  numRatings,
  numComments,
}: RatingBoxProps) => {
  const theme = useTheme();
  const width = useSelector((state: RootState) => state.browser.width);
  const isBrowserDesktop = useSelector(getIsBrowserDesktop);

  const likedPercent = percentages[0].percent
    ? Math.round(percentages[0].percent * 100)
    : null;

  const scrollToReviews = () => {
    if (numComments) {
      document
        .getElementById(REVIEWS_DIV_ID)
        ?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <RatingBoxWrapper
      ratingBoxHeight={RATING_BOX_HEIGHT}
      ratingBoxWidth={RATING_BOX_WIDTH}
    >
      <CircularPercentageWrapper>
        <CircularPercentage
          height={
            isBrowserDesktop
              ? RATING_BOX_HEIGHT - 32
              : Math.min(width / 2 - 32, 200)
          }
          percent={likedPercent}
          barThickness={16}
          label="liked"
        />
      </CircularPercentageWrapper>
      <RatingBarsColumn>
        {percentages.map((metric, ind) =>
          ind === 0 ? null : (
            <ProgressWrapper key={metric.displayName}>
              <ProgressLabel>
                <ProgressTextLabel>{metric.displayName}</ProgressTextLabel>
                {metric.hasDistribution && metric.distribution && (
                  <Popover
                    content={
                      <RatingDistributionGraph
                        distribution={metric.distribution}
                      />
                    }
                  >
                    <DistributionIcon
                      color={theme.light1}
                      borderColor={theme.dark3}
                      className="primaryicon"
                    >
                      <BarChart2 strokeWidth={3} size={15} />
                    </DistributionIcon>
                  </Popover>
                )}
              </ProgressLabel>
              <ProgressBarWrapper>
                <ProgressBar percentComplete={metric.percent} />
                <ProgressNumberLabel>
                  {processRating(metric.percent)}
                </ProgressNumberLabel>
              </ProgressBarWrapper>
            </ProgressWrapper>
          ),
        )}
        <ReviewsAndGraphButtonWrapper>
          <NumCommentsAndRatingsWrapper>
            <NumCommentsWrapper
              onClick={scrollToReviews}
              hasComments={Boolean(numComments)}
            >
              {numComments || 0} {numComments === 1 ? 'comment' : 'comments'}
            </NumCommentsWrapper>
            <NumRatingsWrapper>
              {numRatings || 0} {numRatings === 1 ? 'rating' : 'ratings'}
            </NumRatingsWrapper>
          </NumCommentsAndRatingsWrapper>
        </ReviewsAndGraphButtonWrapper>
      </RatingBarsColumn>
    </RatingBoxWrapper>
  );
};

export default RatingBox;
