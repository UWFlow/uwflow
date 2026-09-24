import FadeIn from 'react-fade-in';
import styled from 'styled-components';
import breakpoint from 'styled-components-breakpoint';

import { Heading2, PageContent, PageWrapper } from 'constants/Mixins';
import NotFound from 'img/404.svg';

export const NotFoundPageWrapper = styled.div`
  ${PageWrapper}
  align-items: center;
  text-align: center;
`;

export const NotFoundText = styled.div`
  ${Heading2}
  margin-bottom: 40px;
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: flex-end;
  width: 100%;
  height: 150px;
  background: ${({ theme }) => theme.primaryExtraDark};
  padding-bottom: 32px;
  ${breakpoint('zero', 'tablet')`
    height: auto;
    padding: 32px 16px;
  `}
`;

export const HeaderText = styled(FadeIn)`
  ${PageContent}
  ${Heading2}
  max-width: 100%;
  color: white;
`;

export const NotFoundImage = styled.div`
  width: 100%;
  height: 100vh;
  margin-bottom: 16px;
  max-width: 300px;
  max-height: 300px;
  background: no-repeat center center url(${NotFound});
`;
