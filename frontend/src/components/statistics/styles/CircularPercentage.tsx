import styled from 'styled-components';

import { Heading1, Small } from 'constants/Mixins';

export const CircleWrapper = styled.div`
  position: relative;
`;

export const NumbersInCircle = styled.div<{ height: number }>`
  position: absolute;
  display: flex;
  flex-direction: column;
  bottom: 0;
  left: 0;
  height: ${({ height }) => height}px;
  width: ${({ height }) => height}px;
  justify-content: center;
  align-items: center;
  transform: scale(${({ height }) => height / 212});
`;
// Transform: scale is iffy hard code but this seems to be the most veratile way to resize the inner text
// Or else we'll have to change the font types with if statements

export const LargePercentage = styled.div`
  ${Heading1};
`;
export const GreyText = styled.div`
  color: ${({ theme }) => theme.dark2};
  ${Small};
`;
