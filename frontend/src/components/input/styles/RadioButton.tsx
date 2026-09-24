import styled from 'styled-components';

import { Body } from 'constants/Mixins';

export const RadioButtonWrapper = styled.div<{ margin: string }>`
  display: flex;
  flex-direction: row;
  margin: ${({ margin }) => margin};
`;

export const RadioButtonOption = styled.div`
  display: flex;
  flex-direction: row;
  margin-right: 24px;

  &:last-child {
    margin-right: 0;
  }
`;

export const RadioButtonText = styled.div`
  ${Body}
  font-weight: 600;
  margin: auto;
  margin-left: 8px;
  color: ${({ theme }) => theme.dark2};
`;
