import styled, { keyframes } from 'styled-components';

const RotateAnimation = keyframes`
  100% {
    transform: rotate(360deg);
  }
`;

const DashAnimation = keyframes`
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -32px;
  }
  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -100px;
  }
`;

export const LoadingSpinnerWrapper = styled.div<{
  margin: string;
  size: number;
}>`
  position: relative;
  overflow: hidden;
  margin: ${({ margin }) => margin};
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  content: '';
`;

export const CircularSvg = styled.svg<{ size: number }>`
  animation: ${RotateAnimation} 2s linear infinite;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  transform-origin: center center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
`;

export const CircleSvgSpinner = styled.circle<{
  strokeWidth: number;
  color?: string;
}>`
  stroke-dasharray: 1, 200;
  stroke-dashoffset: 0;
  animation: ${DashAnimation} 2.5s ease-in-out infinite;
  stroke-linecap: square;
  stroke-width: ${({ strokeWidth }) => strokeWidth}px;
  stroke: ${({ theme, color }) => color || theme.primary};
  z-index: 5;
`;

export const CircleSvgBackground = styled.circle<{
  strokeWidth: number;
  color?: string;
}>`
  stroke-width: ${({ strokeWidth }) => strokeWidth}px;
  stroke: ${({ theme, color }) => color || theme.light4};
  z-index: 2;
`;
