import FadeIn from 'react-fade-in';
import styled from 'styled-components';
import breakpoint from 'styled-components-breakpoint';

import { Body, Heading1, Heading2, Hover, PageContent } from 'constants/Mixins';
import ProfileHeader from 'img/user.svg';

export const ProfileInfoHeaderWrapper = styled.div`
  width: 100%;
  margin-bottom: 32px;
  display: flex;
  background-image: url(${ProfileHeader});
  background-color: ${({ theme }) => theme.primaryExtraDark};
  background-size: cover;
  background-repeat: no-repeat;
  will-change: transform;
  flex-direction: column;
  position: relative;
`;

export const ProfileInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 32px 16px;

  ${breakpoint('tablet')`
    ${PageContent}
    padding: 52px 16px;
    flex-direction: row;
    align-items: center;
    min-height: 320px;
  `}
`;

export const UserPicture = styled.div<{ image: string }>`
  width: 208px;
  height: 208px;
  border-radius: 50%;
  border: 5px solid ${({ theme }) => theme.light1};
  margin-right: 32px;
  object-fit: cover;
  background-image: ${({ image }) => `url(${image})`};
  background-size: 208px;
  background-repeat: no-repeat;
  will-change: transform;
  ${breakpoint('zero', 'tablet')`
    width: 96px;
    height: 96px;
    background-size: 96px;
    margin-bottom: 16px;
  `};
`;

export const UserInfoWrapper = styled.div`
  margin: 48px 0;

  ${breakpoint('zero', 'tablet')`
    margin: 0;
  `}
`;

export const UserName = styled(FadeIn)`
  ${Heading1}
  color: ${({ theme }) => theme.white};
  margin-bottom: 16px;
`;

export const UserProgram = styled(FadeIn)`
  ${Heading2}
  color: ${({ theme }) => theme.light1};
  font-weight: 400;
`;

export const UserProfileOptionWrapper = styled(FadeIn)`
  ${Body}
  color: ${({ theme }) => theme.light1};
  display: flex;
  margin-top: 16px;
  align-items: center;

  ${breakpoint('zero', 'mobileLarge')`
    flex-direction: column;
    align-items: flex-start;
  `}
`;

export const UserEmailText = styled.div`
  margin-right: 5px;
  white-space: no-wrap;
  width: max-content;
`;

export const UserClickable = styled.a`
  display: flex;
  align-items: center;
  text-decoration: underline;
  margin-right: 4px;
  cursor: pointer;
  color: ${({ theme }) => theme.light1};
  ${Hover()}
`;

export const ProfileOptionIconWrapper = styled.div`
  cursor: pointer;
  height: 16px;
  width: 16px;
  color: ${({ theme }) => theme.light1};
  margin-left: 4px;
  margin-top: 2px;
`;
