import FadeIn from 'react-fade-in';
import styled from 'styled-components';
import breakpoint from 'styled-components-breakpoint';

import { Body, Heading1, Heading2 } from 'constants/Mixins';
import { PAGE_CONTENT_WIDTH } from 'constants/PageConstants';
import LandingImage from 'img/landing.svg';

const MAX_PAGE_WIDTH = 1400;

export const LandingPageWrapper = styled.div`
  width: 100vw;
  margin: 0;
  display: flex;
  z-index: 1;
  position: relative;
  min-height: 600px;
  background-color: ${({ theme }) => theme.primaryExtraDark};
`;

export const Nav = styled(FadeIn)`
  position: absolute;
  width: 100vw;
  max-width: ${MAX_PAGE_WIDTH}px;
  margin: auto;
  left: calc((100vw - ${MAX_PAGE_WIDTH}px) / 2);
  z-index: 11;
  @media only screen and (max-width: ${MAX_PAGE_WIDTH + 64}px) {
    left: 0;
  }
`;

export const ProfileWrapper = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  margin: 32px;

  ${breakpoint('zero', 'mobileLarge')`
    margin-right: 16px;
  `}
`;

export const LogoText = styled.div`
  position: absolute;
  top: 32px;
  left: 74px;
  color: white;
  ${Heading2}

  @media only screen and (max-width: ${PAGE_CONTENT_WIDTH}px) {
    left: 32px;
  }
`;

export const TitleText = styled.div`
  color: white;
  ${Heading1}
  margin-bottom: 32px;

  ${breakpoint('zero', 'tablet')`
    ${Heading2}
  `}
`;

export const SubtitleText = styled.div`
  ${Body}
  color: ${({ theme }) => theme.light4};
  font-style: italic;
  font-weight: 300;
  margin-top: 16px;
`;

export const Column = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-end;
  padding: 64px;
  max-width: ${MAX_PAGE_WIDTH}px;
  margin: 0 auto;
  align-items: center;

  @media only screen and (max-width: ${PAGE_CONTENT_WIDTH}px) {
    padding: 32px;
  }
`;

export const TitleSearchBarWrapper = styled(FadeIn)`
  display: flex;
  flex-direction: column;
  max-width: 720px;
`;

export const BackgroundImage = styled.div`
  display: flex;
  min-width: 100vw;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.primaryExtraDark};
  background: url(${LandingImage});
  background-size: cover;
  background-position: left center;
  background-repeat: no-repeat;
  will-change: transform;
`;

export const AuthContent = styled.div<{ loggedIn?: boolean }>`
  display: flex;
  justify-content: flex-end;
  margin-left: 32px;
  min-width: ${({ loggedIn }) => (loggedIn ? '0' : '380px')};
  ${({ loggedIn }) => loggedIn && 'max-width: 320px;'};
`;
