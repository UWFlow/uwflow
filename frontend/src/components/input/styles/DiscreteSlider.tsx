import { SliderItem } from 'react-compound-slider';
import styled from 'styled-components';
import breakpoint from 'styled-components-breakpoint';

import { BoxShadow } from 'constants/Mixins';

export const DiscreteSliderWrapper = styled.div<{
  margin: string;
  fullWidthMobile: boolean;
}>`
  display: flex;
  flex-direction: row;
  margin: ${({ margin }) => margin};
  width: 300px;
  max-width: 100%;

  ${breakpoint('zero', 'tablet')`
    ${({ fullWidthMobile }: { fullWidthMobile: boolean }) =>
      fullWidthMobile ? 'width: calc(100% - 16px);' : ''}
  `}
`;

export const SliderBarWrapper = styled.div`
  width: 100%;
  margin: auto 0;
`;

export const SliderRail = styled.div<{ disabled: boolean }>`
  margin: auto;
  width: 100%;
  height: 8px;
  background-color: ${({ theme }) => theme.light3};
  border-radius: 4px;
  ${({ disabled }) => (disabled ? '' : 'cursor: pointer;')}
  ${BoxShadow}
`;

export const SliderHandle = styled.div<{ disabled: boolean; percent: number }>`
  left: ${({ percent }) => percent}%;
  position: absolute;
  margin-left: -16px;
  margin-top: -20px;
  z-index: 3;
  width: 32px;
  height: 32px;
  border: 3px solid ${({ theme }) => theme.white};
  ${({ disabled }) => (disabled ? '' : 'cursor: pointer;')}
  border-radius: 50%;
  background-color: ${({ theme, color, disabled }) =>
    disabled ? theme.light3 : color};
  ${BoxShadow}
  transition: 0.1s all;
`;

export const SliderTrack = styled.div<{
  disabled: boolean;
  source: SliderItem;
  target: SliderItem;
}>`
  position: absolute;
  height: 8px;
  z-index: 1;
  margin-top: -8px;
  background-color: ${({ theme, color, disabled }) =>
    disabled ? theme.light3 : color};
  border-radius: 4px;
  ${({ disabled }) => (disabled ? '' : 'cursor: pointer;')}
  left: ${({ source }) => source.percent}%;
  width: ${({ target, source }) => target.percent - source.percent}%;
  transition: 0.2s all;
`;

export const SliderTick = styled.div<{ disabled: boolean; percent: number }>`
  position: absolute;
  margin-left: -8px;
  margin-top: -11px;
  z-index: 2;
  height: 8px;
  width: 8px;
  background-color: ${({ theme, color, disabled }) =>
    disabled ? theme.light3 : color};
  border-radius: 50%;
  box-sizing: content-box;
  border: 3px solid ${({ theme }) => theme.white};
  ${({ disabled }) => (disabled ? '' : 'cursor: pointer;')}
  left: ${({ percent }) => percent}%;
  transition: 0.2s all;
`;
