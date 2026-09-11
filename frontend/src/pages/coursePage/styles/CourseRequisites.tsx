import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Body, BoxShadow, Card, Heading3, Hover } from 'constants/Mixins';

export const CourseRequisitesWrapper = styled.div`
  ${Card('32px 24px')}
  ${BoxShadow}
${Heading3}
margin-bottom: 32px;
`;

export const Header = styled.div`
  ${Heading3}
  margin-bottom: 16px;
`;

export const LineOfText = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const CourseText = styled(Link)`
  ${Body}
  font-weight: 600;
  color: ${({ theme }) => theme.courses};
  ${Hover()}
`;

export const GreyText = styled.div`
  ${Body}
  color: ${({ theme }) => theme.dark2};
`;

export const ReqText = styled.div`
  ${Body}
  color: ${({ theme }) => theme.dark2};
  margin-bottom: 16px;
`;

export const ReqInfo = styled.div`
  ${Body}
  color: ${({ theme }) => theme.dark3};
  font-weight: 400;
  margin-bottom: 16px;
  font-style: italic;
  font-size: 14px;
`;
