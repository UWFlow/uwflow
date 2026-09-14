import styled from 'styled-components';

import { PageWrapper } from 'constants/Mixins';

export const WelcomePageWrapper = styled.div`
  ${PageWrapper}
  padding-top: 32px;
  display: flex;
  overflow: auto;
  margin: auto;

  @media only screen and (max-width: 800px) {
    padding: 16px;
    box-sizing: border-box;
  }
`;
