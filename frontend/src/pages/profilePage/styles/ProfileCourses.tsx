import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';
import breakpoint from 'styled-components-breakpoint';

import { Body, Heading1, Heading2, Link } from 'constants/Mixins';

export const ProfileCoursesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 32px;
  border-radius: 4px;
  background: ${({ theme }) => theme.white};
`;

export const ProfileCoursesCourse = styled.div`
  display: flex;
  flex-direction: row;
  padding: 24px 32px;
  border-bottom: 1px solid ${({ theme }) => theme.light3};
  justify-content: space-between;

  &:last-child {
    border: none;
  }

  ${breakpoint('zero', 'tablet')`
    padding: 16px;
  `}
`;

export const ProfileCourseText = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 32px;
  min-width: 112px;
  width: 100%;

  @media only screen and (max-width: 500px) {
    margin-right: 16px;
  }
`;

export const ProfileCourseCode = styled(RouterLink)`
  ${Link}
  font-size: 18px;
  color: ${({ theme }) => theme.courses};
  margin: auto 0;
`;

export const ProfileCourseName = styled.div`
  ${Body}
  color: ${({ theme }) => theme.dark2};
  margin: auto 0;
`;

export const ProfileCourseLiked = styled.div`
  ${Heading1}
  font-size: 36px;
  color: ${({ theme }) => theme.dark2};
  margin-right: 16px;
  display: flex;
  align-items: center;
  width: max-content;
`;

export const LikedThisCourseText = styled.div`
  ${Body}
  color: ${({ theme }) => theme.dark3};
  margin: auto 0;
  margin-right: 16px;
  width: 100%;
  min-width: 64px;
  max-width: 64px;
`;

export const AddReviewIcon = styled.span`
  display: flex;
  margin: auto 0;
  margin-right: 4px;
`;

export const ProfileCourseReviewButtonText = styled.span`
  ${Body}
  font-weight: 500;
  color: ${({ theme }) => theme.dark2};
  display: flex;
  margin-top: 1px;
  line-height: 14px;
`;

export const ReviewButtonContents = styled.div`
  display: flex;
  align-items: center;
  width: fit-content;
  margin: auto;
`;

export const LikeToggleWrapper = styled.span`
  display: flex;

  @media only screen and (max-width: 920px) {
    display: none;
  }
`;

export const LikedCourseWrapper = styled.span`
  display: flex;

  @media only screen and (max-width: 500px) {
    display: none;
  }
`;

export const YourCoursesWrapper = styled.div<{ columnBreak: number }>`
  ${Heading2}
  display: flex;
  justify-content: space-between;
  padding: 24px 32px;

  ${breakpoint('zero', 'tablet')`
    padding: 16px;
  `}

  @media only screen and (max-width: ${({ columnBreak }) => columnBreak}px) {
    flex-direction: column;
  }
`;

export const HeaderText = styled.div<{ columnBreak: number }>`
  @media only screen and (max-width: ${({ columnBreak }) => columnBreak}px) {
    margin-bottom: 16px;
  }
`;
