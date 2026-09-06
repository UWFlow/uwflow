import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';
import breakpoint from 'styled-components-breakpoint';

import { Body, Card, Hover, Link } from 'constants/Mixins';

export const ReviewWrapper = styled.div<{ isUserReview: boolean }>`
  margin-bottom: 32px;
  ${({ theme, isUserReview }) =>
    isUserReview
      ? `border: 3px solid ${theme.accent};`
      : `border: 3px solid ${theme.light2};`}
  border-radius: 4px;
  ${breakpoint('zero', 'desktop')`
    padding: 16px;
    align-content: center;
  `}

  ${breakpoint('desktop')`
    ${Card('24px 32px')}
    margin-bottom: 32px;
    justify-content: space-between;
    flex-direction: row;
  `}
`;

export const ReviewPictureAndMetricsRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export const ReviewPictureAndUpvotesWrapper = styled.div`
  display: flex;
  margin-bottom: 32px;

  ${breakpoint('zero', 'tablet')`
    align-items: center;
  `}

  ${breakpoint('tablet')`
    margin-right: 32px;
    position: relative;
  `}
`;

export const ReviewPicture = styled.div<{ image: string }>`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background-color: ${({ theme }) => theme.light3};
  background-image: ${({ image }) => `url(${image})`};
  background-size: 64px;
  ${breakpoint('zero', 'tablet')`
    margin-right: 8px;
  `};
`;

export const ReviewUpvotes = styled.button<{ selected: boolean }>`
  padding: 0;
  width: 40px;
  height: 40px;
  background-color: ${({ selected, theme }) =>
    selected ? theme.primary : theme.light1};
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  border-radius: 20px 20px 20px 20px;
  border: 2px solid ${({ theme }) => theme.light4};
  cursor: pointer;
  ${Hover()}

  ${breakpoint('tablet')`
    position: absolute;
    top: 36px;
    right: -16px;
    cursor: pointer;
  `}
`;

export const ReviewTextWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  word-wrap: break-word;
`;

// ReviewText and its "Show more" toggle are styled with Tailwind in Review.tsx.

export const ReviewAuthor = styled.div`
  font-style: italic;
  color: ${({ theme }) => theme.dark2};
  margin-top: 16px;
  font-size: 14px;
`;

export const ReviewMetricsWrapper = styled.table`
  min-width: 168px;
  margin-left: 16px;
`;

export const ReviewMetricsBody = styled.tbody`
  font-weight: 600;
  color: ${({ theme }) => theme.dark2};
`;

export const SingleMetricWrapper = styled.tr``;

export const SingleMetricSquares = styled.td`
  display: flex;
  justify-content: flex-end;
`;

export const SingleMetricLabel = styled.td`
  ${Body}
  color: ${({ theme }) => theme.dark2};
  padding-left: 8px;
  vertical-align: top;
`;

export const UpvoteNumber = styled.div<{ selected: boolean }>`
  ${Body}
  color: ${({ selected, theme }) => (selected ? 'white' : theme.dark3)};
  margin-left: 4px;
`;

export const ProfText = styled(RouterLink)`
  color: ${({ theme }) => theme.professors};
  ${Link}
  font-size: 14px;
`;
