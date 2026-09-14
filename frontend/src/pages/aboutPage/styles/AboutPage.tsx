import FadeIn from 'react-fade-in';
import styled from 'styled-components';
import breakpoint from 'styled-components-breakpoint';

import {
  Body,
  Heading1,
  Heading2,
  Link,
  PageContent,
  PageWrapper as _PageWrapper,
} from 'constants/Mixins';
import PageHeaderBackground from 'img/generic.svg';

export const PageWrapper = styled.div`
  ${_PageWrapper}
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  width: 100%;
  height: 208px;
  background-image: url(${PageHeaderBackground});
  background-color: ${({ theme }) => theme.primaryExtraDark};
  background-size: cover;
  background-repeat: no-repeat;
  will-change: transform;
  padding-bottom: 32px;
  margin-bottom: 32px;

  ${breakpoint('zero', 'tablet')`
    height: auto;
    padding: 32px 16px;
  `}
`;

export const HeaderText = styled(FadeIn)`
  ${PageContent}
  ${Heading1}
  max-width: 800px;
  color: ${({ theme }) => theme.white};
`;

export const PageContentWrapper = styled(FadeIn)`
  ${PageContent}
  max-width: 800px;
  margin: auto;

  ${breakpoint('zero', 'tablet')`
    padding: 0 16px 16px 16px;
  `}
`;

export const PageBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  margin-top: 16px;
`;

export const PageBodyHeader = styled.div`
  ${Heading2}
  font-size: 30px;
  margin-bottom: 16px;
`;

export const PageBodyParagraph = styled.div`
  ${Body}
  line-height: 1.5;
  margin-bottom: 64px;
`;

export const ContributorLink = styled.a`
  ${Link}
  line-height: 2;
`;
