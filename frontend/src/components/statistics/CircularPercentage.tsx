import React from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { useTheme } from 'styled-components';

import {
  CircleWrapper,
  GreyText,
  LargePercentage,
  NumbersInCircle,
} from './styles/CircularPercentage';

type CircularPercentageProps = {
  barThickness: number;
  height: number;
  label: string;
  percent: number | null;
};

const CircularPercentage = ({
  height,
  percent,
  barThickness,
  label,
}: CircularPercentageProps) => {
  const theme = useTheme();
  const pieValue = percent === null ? 0 : 100 - percent;

  return (
    <CircleWrapper>
      <PieChart width={height} height={height}>
        <Pie
          dataKey="value"
          data={[{ value: percent }, { value: pieValue }]}
          cx="50%"
          cy="50%"
          startAngle={90}
          endAngle={450}
          outerRadius={height / 2}
          innerRadius={height / 2 - barThickness}
          blendStroke={true}
        >
          <Cell fill={theme.primary} />
          <Cell fill={theme.light3} />
        </Pie>
      </PieChart>
      <NumbersInCircle height={height}>
        <LargePercentage>
          {percent !== null ? `${percent}%` : 'N/A'}
        </LargePercentage>
        <GreyText>{label}</GreyText>
      </NumbersInCircle>
    </CircleWrapper>
  );
};

export default CircularPercentage;
