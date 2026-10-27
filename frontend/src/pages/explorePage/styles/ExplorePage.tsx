import FadeIn from 'react-fade-in';
import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';
import breakpoint from 'styled-components-breakpoint';

import {
  Heading2,
  Hover,
  Link,
  PageContent,
  PageWrapper,
  ThinColumn,
  WideColumn,
} from 'constants/Mixins';
import ExploreHeader from 'img/explore.svg';

export const ExplorePageWrapper = styled.div`
  ${PageWrapper}
`;

export const ExploreHeaderWrapper = styled.div`
  width: 100%;
  margin-bottom: 32px;
  display: flex;
  background-image: url(${ExploreHeader});
  background-color: ${({ theme }) => theme.primaryExtraDark};
  background-size: cover;
  background-repeat: no-repeat;
  will-change: transform;
  flex-direction: column;
  position: relative;

  ${breakpoint('zero', 'tablet')`
    padding: 0 16px;
  `}
`;

export const ExploreHeaderText = styled(FadeIn)`
  ${PageContent}
  ${Heading2}
  padding-top: 48px;
  padding-bottom: 16px;
  word-break: break-word;
  min-height: 104px;
  display: flex;
  flex-direction: row;
  margin: auto;
  position: relative;
  color: ${({ theme }) => theme.light1};
  font-weight: 600;
`;

export const ColumnWrapper = styled.div`
  ${PageContent}
  display: flex;
  flex-flow: row wrap;
`;

export const Column1 = styled(FadeIn)`
  ${WideColumn}

  @media only screen and (max-width: 960px) {
    width: 65%;
  }

  ${breakpoint('zero', 'tablet')`
    width: 100%;
    padding: 0;
    order: 2;
  `}
`;

export const Column2 = styled(FadeIn)`
  ${ThinColumn}

  @media only screen and (max-width: 960px) {
    width: 35%;
  }

  ${breakpoint('zero', 'tablet')`
    width: 100%;
    order: 1;
  `}
`;

export const CourseCode = styled(RouterLink)`
  ${Link}
  color: ${({ theme }) => theme.courses};
  ${Hover()}
`;

export const ProfName = styled(RouterLink)`
  ${Link}
  color: ${({ theme }) => theme.professors};
  ${Hover()}
`;
