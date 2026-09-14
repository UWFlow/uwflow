import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';

import { Body, BoxShadow, Card, Heading3, Link } from 'constants/Mixins';

export const ShortlistBoxWrapper = styled.div`
  ${Card('0')}
  ${BoxShadow}
  margin-bottom: 32px;
  padding-bottom: 8px;
`;

export const ShortlistHeading = styled.div`
  ${Heading3}
  color: ${({ theme }) => theme.dark1};
  padding: 32px 32px 16px 32px;
  border-bottom: 1px solid ${({ theme }) => theme.light3};
`;

export const ShortlistContentWrapper = styled.div`
  padding: 0 16px;
`;

export const ShortlistCourse = styled.div`
  display: flex;
  flex-direction: row;
  vertical-align: middle;
  padding: 16px;
`;

export const ShortListCourseText = styled.div`
  display: block;
  margin-left: 16px;
`;

export const ShortlistCourseCode = styled(RouterLink)`
  ${Link}
  font-size: 18px;
  color: ${({ theme }) => theme.courses};
`;

export const ShortlistCourseName = styled.div`
  ${Body}
  color: ${({ theme }) => theme.dark2};
  margin-top: 4px;
`;

export const ShortlistCoursePlaceholder = styled.div`
  ${Body}
  color: ${({ theme }) => theme.dark2};
`;
