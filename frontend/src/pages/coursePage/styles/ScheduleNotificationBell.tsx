import styled from 'styled-components';

import { BoxShadow, Hover } from 'constants/Mixins';

export const NotificationBellWrapper = styled.button<{ selected: boolean }>`
  border-radius: 50%;
  height: 28px;
  width: 28px;
  padding: 4px;
  margin-right: 8px;
  color: ${({ theme, selected }) => (selected ? theme.white : theme.light4)};
  background: ${({ theme, selected }) =>
    selected ? theme.primary : theme.light1};
  border: 2px solid
    ${({ theme, selected }) => (selected ? theme.primaryDark : theme.light4)};
  cursor: pointer;
  ${BoxShadow}
  ${Hover()}
`;
