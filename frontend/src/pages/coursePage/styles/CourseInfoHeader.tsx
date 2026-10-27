import FadeIn from 'react-fade-in';
import styled from 'styled-components';
import breakpoint from 'styled-components-breakpoint';

import {
  Body,
  Heading1,
  Heading2,
  HoverTransition,
  PageContent,
  Small,
} from 'constants/Mixins';
import CourseHeader from 'img/course.svg';

export const CourseInfoHeaderWrapper = styled.div`
  width: 100%;
  margin-bottom: 32px;
  display: flex;
  background-color: ${({ theme }) => theme.white};
  flex-direction: column;
  position: relative;
`;

export const CourseCodeAndNameSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background-image: url(${CourseHeader});
  background-color: ${({ theme }) => theme.primaryExtraDark};
  background-size: cover;
  background-repeat: no-repeat;
  background-position: left center;
  will-change: transform;
  position: relative;
  min-height: 160px;
  padding: 16px;

  ${breakpoint('tablet')`
    min-height: 320px;
  `}
`;

export const CourseCodeAndStar = styled.div`
  display: flex;
  align-items: flex-start;

  ${breakpoint('tablet')`
    ${PageContent}
    margin: 0 auto;
  `}
`;

export const StarAlignmentWrapper = styled(FadeIn)`
  display: flex;
  flex-direction: column;
  margin-top: 3px;

  ${breakpoint('tablet')`
    margin-left: 16px;
  `}
`;

export const CourseCode = styled(FadeIn)<{ ratingBoxWidth: number }>`
  ${Heading1}
  color: white;
  text-transform: uppercase;

  ${breakpoint('zero', 'tablet')`
    margin-right: 16px;
  `}

  ${breakpoint('tablet')`
    max-width: calc(100% - ${({ ratingBoxWidth }: { ratingBoxWidth: number }) =>
      ratingBoxWidth}px);
  `}
`;

export const CourseNameWrapper = styled(FadeIn)`
  ${breakpoint('tablet')`
    ${PageContent}
    margin: 16px auto 0 auto;
  `}
`;

export const CourseName = styled.div<{ ratingBoxWidth: number }>`
  ${Heading2}
  color: ${({ theme }) => theme.light1};
  font-weight: 400;

  ${breakpoint('tablet')`
    max-width: calc(100% - ${({ ratingBoxWidth }: { ratingBoxWidth: number }) =>
      ratingBoxWidth}px);
  `}
`;

export const CourseDescriptionSection = styled.div`
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

export const Description = styled(FadeIn)<{ ratingBoxWidth: number }>`
  ${Body}
  position: relative;
  font-weight: 500;
  vertical-align: middle;
  color: ${({ theme }) => theme.dark2};
  line-height: 1.5;

  ${breakpoint('zero', 'tablet')`
    margin-bottom: 16px;
    padding: 0 16px;
    min-width: 100%;
  `}

  ${breakpoint('tablet')`
    margin-top: 48px;
    max-width: calc(100% - ${({ ratingBoxWidth }: { ratingBoxWidth: number }) =>
      ratingBoxWidth}px);
  `}
`;

export const RatingsSection = styled(FadeIn)`
  ${breakpoint('zero', 'tablet')`
    width: 100%;
  `}

  ${breakpoint('tablet')`
    position: absolute;
    right: 0;
    bottom: 20%;
  `}
`;

export const RedditSearchButton = styled.a`
  ${Small}
  ${HoverTransition('background-color, color, border-color')}
  align-items: center;
  background-color: transparent;
  border: 1.5px solid ${({ theme }) => theme.light3};
  border-radius: 5px;
  color: ${({ theme }) => theme.dark2};
  display: flex;
  justify-content: center;
  margin: 12px 0 0 auto;
  padding: 6px 14px;
  text-decoration: none;
  width: fit-content;

  ${breakpoint('tablet')`
    margin-right: 32px;
  `}

  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.light2};
    border-color: ${({ theme }) => theme.light4};
    color: ${({ theme }) => theme.dark1};
    cursor: pointer;

    svg {
      color: #ff4500;
    }
  }

  svg {
    color: ${({ theme }) => theme.dark3};
    flex: none;
    font-size: 14px;
    margin-right: 6px;
    ${HoverTransition('color')}
  }

  ${breakpoint('zero', 'tablet')`
    margin: 12px 16px 24px auto;
    width: calc(100% - 32px);
    justify-content: center;
  `}
`;

export const RedditSearchButtonText = styled.span`
  line-height: 1.25;
`;
