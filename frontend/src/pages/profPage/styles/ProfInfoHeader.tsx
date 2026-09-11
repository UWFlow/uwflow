import FadeIn from 'react-fade-in';
import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';
import breakpoint from 'styled-components-breakpoint';

import { Heading1, Heading3, Hover, PageContent } from 'constants/Mixins';
import ProfHeader from 'img/prof.svg';

export const ProfInfoHeaderWrapper = styled.div`
  width: 100%;
  margin-bottom: 32px;
  display: flex;
  background-color: ${({ theme }) => theme.white};
  flex-direction: column;
  position: relative;
`;

export const ProfNameSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background-image: url(${ProfHeader});
  background-color: ${({ theme }) => theme.primaryExtraDark};
  background-size: cover;
  background-repeat: no-repeat;
  will-change: transform;
  position: relative;
  min-height: 120px;
  padding: 16px;

  ${breakpoint('zero', 'tablet')`
    padding: 24px 16px;
  `}

  ${breakpoint('tablet')`
    min-height: 320px;
  `}
`;

export const ProfNameWrapper = styled(FadeIn)`
  ${PageContent}
  margin: auto;
  margin-bottom: 16px;

  ${breakpoint('zero', 'tablet')`
    margin-bottom: 0;
  `}
`;

export const ProfName = styled.div<{ ratingBoxWidth: number }>`
  color: ${({ theme }) => theme.white};
  ${Heading1}

  ${breakpoint('zero', 'tablet')`
    padding: 0 16px;
    min-width: 100%;
  `}

  ${breakpoint('tablet')`
    max-width: calc(100% - ${({ ratingBoxWidth }: { ratingBoxWidth: number }) =>
      ratingBoxWidth}px);
  `}
`;

export const ProfDescriptionSection = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0;
  position: relative;

  ${breakpoint('tablet')`
    ${PageContent}
    padding-bottom: 48px;
    margin: auto;
  `}
`;

export const RatingsSection = styled(FadeIn)<{ ratingBoxHeight: number }>`
  ${breakpoint('zero', 'tablet')`
    width: 100%;
  `}

  ${breakpoint('tablet')`
    position: absolute;
    right: 0;
    bottom: 20%;
  `}
`;

export const CourseLink = styled(RouterLink)`
  ${Heading3}
  color: ${({ theme }) => theme.courses};
  text-decoration: underline;
  margin-left: 4px;
  ${Hover()}
`;
