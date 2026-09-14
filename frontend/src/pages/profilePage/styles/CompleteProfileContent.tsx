import styled from 'styled-components';

import { Heading3, Heading4 } from 'constants/Mixins';

export const CompleteProfileHeading = styled.div`
  ${Heading3}
  color: ${({ theme }) => theme.dark1};
`;

export const CheckedItem = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin: 32px 0;
  transition: 0.2s all;
`;

export const CheckedText = styled.div<{ checked: boolean }>`
  margin: auto;
  margin-left: 16px;
  ${Heading4}
  color: ${({ theme, checked }) => (checked ? theme.dark3 : theme.dark2)};
  transition: 0.2s all;
`;
