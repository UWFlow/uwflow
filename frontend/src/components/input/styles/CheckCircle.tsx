import styled from 'styled-components';

import { BoxShadow, Hover } from 'constants/Mixins';

export const CheckCircleWrapper = styled.div<{
  checked: boolean;
  color: string;
  disabled: boolean;
  width: number;
}>`
  width: ${({ width }) => width}px;
  min-width: ${({ width }) => width}px;
  height: ${({ width }) => width}px;
  min-height: ${({ width }) => width}px;
  background-color: ${({ checked, color, theme }) =>
    checked ? color : theme.light2};
  border: 3px solid
    ${({ checked, color, theme }) => (checked ? color : theme.light4)};
  border-radius: 50%;
  user-select: none;
  cursor: ${({ disabled }) => (disabled ? 'inherit' : 'pointer')};
  ${BoxShadow}
  position: relative;
  ${({ disabled }) => (disabled ? '' : Hover())}
`;

export const CheckIcon = styled.div`
  position: absolute;
  top: 2px;
  left: 1px;
`;
