import styled from 'styled-components';

import { Body } from 'constants/Mixins';

export const BubbleRatingsWrapper = styled.div`
  display: flex;
  padding-bottom: 16px;

  @media only screen and (max-width: 800px) {
    padding-bottom: 8px;
  }
`;

export const UnitCircle = styled.div<{
  diameter: number;
  filled: boolean;
  filledColor?: string;
  emptyColor?: string;
}>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ diameter }) => diameter}px;
  height: ${({ diameter }) => diameter}px;
  border-radius: ${({ diameter }) => diameter / 2}px;
  background-color: ${({ filledColor, emptyColor, theme, filled }) =>
    filled ? filledColor || theme.primary : emptyColor || 'white'};
  border: 2px solid
    ${({ filled, theme }) => (filled ? theme.primaryDark : theme.light4)};
  margin: 0 1px;
`;

export const ThumbsWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Thumb = styled.div<{ colored: boolean }>`
  ${Body}
  color: ${({ theme, colored }) => (colored ? theme.primary : theme.light4)};
  margin-left: 4px;
`;
