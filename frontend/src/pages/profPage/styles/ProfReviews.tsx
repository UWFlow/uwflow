import { Link } from 'react-router-dom';
import styled, { DefaultTheme } from 'styled-components';
import breakpoint from 'styled-components-breakpoint';

import {
  Body,
  BoxShadow,
  Card,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Hover,
} from 'constants/Mixins';

export const ProfCourseReviewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  color: ${({ theme }) => theme.dark2};
`;

export const NoReviewsBox = styled.div`
  ${Card()}
  align-items: center;
  ${Heading3}
  color: ${({ theme }) => theme.dark2}
`;

export const ReviewsForSingleCourseWrapper = styled.div`
  ${Card('0')}
  ${BoxShadow}
  padding-bottom: 0;
  margin-bottom: 32px;
`;

export const ReviewListWrapper = styled.div`
  ${breakpoint('tablet')`
    padding: 32px 32px 0 32px;
  `}
`;

export const CourseRatings = styled.div`
  display: flex;
  flex-direction: column;
`;

export const CourseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;

  ${breakpoint('zero', 'tablet')`
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 0;
  `}
`;

export const CourseNameAndCode = styled.div`
  display: flex;
  flex-direction: column;
`;

export const CourseCode = styled(Link)`
  ${Heading2}
  color: ${({ theme }) => theme.courses};
  margin-bottom: 16px;

  ${breakpoint('zero', 'tablet')`
    margin: 16px 16px 0 16px;
  `}
  ${Hover()}
`;

export const CourseName = styled.div`
  ${Heading2}
  font-size: 24px;

  ${breakpoint('zero', 'tablet')`
    margin: 16px 16px 0 16px;
  `}
`;

export const SortFilterDropdownWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  margin-right: 16px;
`;

export const CourseDropdownsWrapper = styled.div`
  ${Card('0', '0')}
  ${BoxShadow}
  display: flex;
  flex-wrap: wrap;
  padding: 32px 32px 24px 32px;
  margin-bottom: 32px;

  ${breakpoint('zero', 'tablet')`
    padding: 16px 16px 8px 16px;
  `}
`;

export const DropdownPanelWrapper = styled.div`
  display: flex;
  margin: 16px 32px 32px 0;
  align-items: center;

  ${breakpoint('zero', 'tablet')`
    padding: 24px 16px;
    border-bottom: 1px solid ${({ theme }: { theme: DefaultTheme }) =>
      theme.light2};
    background-color: white;
    margin: 0 0 32px 0;
  `}
`;

export const DropdownTableText = styled.div`
  ${Heading4}
  color: ${({ theme }) => theme.dark1};
  white-space: nowrap;
`;

export const CourseLikedMetric = styled.div`
  display: flex;
  align-items: center;

  ${breakpoint('zero', 'tablet')`
    margin: 8px 16px 0 16px;
  `}
`;

export const CourseLikedPercent = styled.div`
  ${Heading1}

  ${breakpoint('zero', 'tablet')`
    font-size: 32px;
  `}
`;

export const CourseLikedPercentLabel = styled.div`
  ${Body}
  width: 128px;
  margin-left: 16px;

  ${breakpoint('zero', 'tablet')`
    width: 100%;
  `}
`;

export const ShowMoreReviewsSection = styled.button`
  background: ${({ theme }) => theme.light3};
  border: none;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 64px;
  cursor: pointer;
  border-radius: 0 0 4px 4px;
  ${Hover()}
`;

export const ShowMoreReviewsText = styled.div`
  ${Heading4}
  color: ${({ theme }) => theme.dark2};
  cursor: pointer;
`;
