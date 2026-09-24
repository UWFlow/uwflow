import React from 'react';

import {
  CircleSvgBackground,
  CircleSvgSpinner,
  CircularSvg,
  LoadingSpinnerWrapper,
} from './styles/LoadingSpinner';

type LoadingSpinnerProps = {
  margin?: string;
  size?: number;
  strokeWidth?: number;
  spinnerColor?: string;
  backgroundColor?: string;
};

const LoadingSpinner = ({
  margin = 'auto',
  size = 128,
  strokeWidth = 8,
  spinnerColor,
  backgroundColor,
}: LoadingSpinnerProps) => {
  return (
    <LoadingSpinnerWrapper margin={margin} size={size}>
      <CircularSvg
        size={size}
        viewBox={`${size / 2} ${size / 2} ${size} ${size}`}
      >
        <CircleSvgBackground
          cx={size}
          cy={size}
          r={size / 4}
          fill="none"
          strokeWidth={strokeWidth}
          color={backgroundColor}
        />
        <CircleSvgSpinner
          cx={size}
          cy={size}
          r={size / 4}
          fill="none"
          strokeWidth={strokeWidth}
          color={spinnerColor}
        />
      </CircularSvg>
    </LoadingSpinnerWrapper>
  );
};

export default LoadingSpinner;
