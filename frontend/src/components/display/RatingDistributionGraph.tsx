import React from 'react';

import {
  BarLabel,
  BarPercentage,
  BarWrapper,
  Graph,
  GraphDistributionLabel,
  GraphTitle,
} from './styles/RatingDistributionGraph';
import ProgressBar from './ProgressBar';

type Distribution = {
  displayName: string;
  buckets: Array<{
    value: number;
    count: number;
  }>;
  total: number;
};

type RatingDistributionGraphProps = {
  distribution: Distribution | null;
};

const RatingDistributionGraph = ({
  distribution,
}: RatingDistributionGraphProps) => {
  if (!distribution) return null;

  return (
    <Graph>
      <GraphTitle>
        <GraphDistributionLabel>
          {distribution.displayName}{' '}
        </GraphDistributionLabel>
        Distribution
      </GraphTitle>
      {distribution.buckets.map((bucket, index) => {
        const percentage =
          distribution.total > 0
            ? (bucket.count / distribution.total) * 100
            : 0;
        return (
          <BarWrapper key={index}>
            <BarLabel>{bucket.value + 1}</BarLabel>
            <ProgressBar percentComplete={percentage / 100} />
            <BarPercentage>({bucket.count})</BarPercentage>
          </BarWrapper>
        );
      })}
    </Graph>
  );
};

export default RatingDistributionGraph;
