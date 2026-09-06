import React, { useEffect, useState } from 'react';

import { Complete, ProgressBarWrapper } from './styles/ProgressBar';

type ProgressBarProps = {
  percentComplete: number;
};

const ProgressBar = ({ percentComplete }: ProgressBarProps) => {
  const [percentWidth, setPercentWidth] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setPercentWidth(Math.round(percentComplete * 100));
    }, 500);
  }, [percentComplete]);

  return (
    <ProgressBarWrapper>
      <Complete width={percentWidth} />
    </ProgressBarWrapper>
  );
};
export default ProgressBar;
