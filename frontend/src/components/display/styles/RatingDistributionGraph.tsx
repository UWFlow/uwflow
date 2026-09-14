import styled from 'styled-components';

import { Body, Heading4 } from 'constants/Mixins';

export const Graph = styled.div`
  width: 300px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const BarWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

export const BarLabel = styled.div`
  ${Body}
  color: ${({ theme }) => theme.dark2};
  min-width: 24px;
`;

export const BarPercentage = styled.div`
  ${Body}
  color: ${({ theme }) => theme.dark2};
  min-width: 48px;
  text-align: right;
`;

export const GraphTitle = styled.div`
  ${Body}
  color: ${({ theme }) => theme.dark1};
`;

export const GraphDistributionLabel = styled.span`
  ${Heading4}
  color: ${({ theme }) => theme.dark1};
`;
