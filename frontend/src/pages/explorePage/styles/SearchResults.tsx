import styled from 'styled-components';

import { BoxShadow, Card } from 'constants/Mixins';

export const SearchResultsContent = styled.div`
  overflow-x: auto;
`;

export const ResultsError = styled.div`
  ${Card()}
  ${BoxShadow}
  margin-top: 16px;
  background: ${({ theme }) => theme.white};
`;
