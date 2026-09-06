import styled from 'styled-components';
import breakpoint from 'styled-components-breakpoint';

import {
  BoxShadow,
  Card,
  Heading3,
  PageContent,
  PageWrapper,
  ThinColumn,
  WideColumn,
} from 'constants/Mixins';

export const CoursePageWrapper = styled.div`
  ${PageWrapper}
`;

export const ColumnWrapper = styled.div`
  ${PageContent}
  display: flex;
  flex-flow: row wrap;
`;

export const Column1 = styled.div`
  ${WideColumn}

  ${breakpoint('zero', 'tablet')`
    width: 100%;
    padding: 0;
    order: 2;
  `}
`;

export const Column2 = styled.div`
  ${ThinColumn}

  ${breakpoint('zero', 'tablet')`
    width: 100%;
    order: 1;
  `}
`;

export const ReviewWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const CourseReviewQuestionBox = styled.div`
  ${Card('24px')}
  ${BoxShadow}
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;

  ${breakpoint('zero', 'tablet')`
    flex-direction: column;
  `}
`;

export const CourseQuestionTextAndToggle = styled.div`
  display: flex;
  align-items: center;
  margin-right: 24px;

  ${breakpoint('zero', 'tablet')`
    width: 100%;
    margin-right: 0;
    margin-bottom: 16px;
    justify-content: space-between;
  `}
`;

export const CourseReviewQuestionText = styled.div`
  ${Heading3}
  margin-right: 24px;

  ${breakpoint('zero', 'tablet')`
    max-width: 60%;
  `}
`;
