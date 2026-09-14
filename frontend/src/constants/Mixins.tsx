import { keyframes } from 'styled-components';

import theme from './GlobalTheme';
import {
  FOOTER_HEIGHT,
  FOOTER_MARGIN_TOP,
  PAGE_CONTENT_WIDTH,
} from './PageConstants';

export const InterFont = `Inter, -apple-system, BlinkMacSystemFont, San Francisco, Roboto, Segoe UI, Helvetica Neue, sans-serif`;
export const AndersonFont = `'Anderson Grotesk', -apple-system, BlinkMacSystemFont, San Francisco, Roboto, Segoe UI, Helvetica Neue, sans-serif`;

export const PageContentZIndex = 'z-index: -1;';

export const PageWrapper = `
  min-height: calc(100vh - ${FOOTER_HEIGHT}px - ${FOOTER_MARGIN_TOP}px);
  display: flex;
  flex-direction: column;
  padding-bottom: 32px;
  width: 100vw;
`;

export const PageContent = `
  max-width: ${PAGE_CONTENT_WIDTH}px;
  width: 100%;
  margin: 0 auto;

  padding-left: 32px;
  padding-right: 32px;

  @media only screen and (max-width: ${theme.breakpoints.tablet - 1}px) {
    padding-left: 0;
    padding-right: 0;
  }
`;

export const ModalZIndex = 'z-index: 2000;';

export const WideColumn = `
  display: flex;
  flex-direction: column;
  padding-right: 32px;
  width: 70%;
`;

export const ThinColumn = `
  display: flex;
  flex-direction: column;
  width: 30%;
`;

/* Fonts */
export const Heading1 = `
  font-family: ${AndersonFont};
  font-size: 40px;
  font-weight: 800;

  @media only screen and (max-width: ${theme.breakpoints.tablet}px) {
    font-size: 32px;
  }
`;

export const Heading2 = `
  font-family: ${AndersonFont};
  font-size: 32px;
  font-weight: 800;

  @media only screen and (max-width: ${theme.breakpoints.tablet}px) {
    font-size: 28px;
  }
`;

export const Heading3 = `
  font-family: ${AndersonFont};
  font-size: 20px;
  font-weight: 600;
`;

export const Heading4 = `
  font-family: ${AndersonFont};
  font-size: 18px;
  font-weight: 600;
`;

export const Body = `
  font-family: ${InterFont};
  font-weight: 400;
  font-size: 16px;
`;

export const Small = `
  font-weight: 300;
  font-size: 14px;
`;

export const HoverTransition = (target = 'all', time = '0.1s') => `
  transition: ${target} ${time} ease-in;
`;

export const Hover = (darker = false) => `
  ${HoverTransition()}
  &:hover, &:focus {
    cursor: pointer;
    filter: brightness(${darker ? '60%' : '85%'});
  }
`;

export const Link = `
  font-weight: 600;
  font-size: 16px;
  text-decoration: underline;
  cursor: pointer;
  width: fit-content;
  ${Hover(true)}
`;

export const BoxShadow = `
  box-shadow: 0px 2px 5px rgba(236, 237, 237, 0.4),
  0px 0px 5px rgba(142, 147, 148, 0.2);
`;

export const DarkBoxShadow = `
  box-shadow: 0px 0px 10px ${theme.primaryExtraDark};
`;

export const BottomBoxShadow = `
  box-shadow: 0px 1px 3px rgba(236, 237, 237, 0.4),
    0px 1px 3px rgba(142, 147, 148, 0.2);
`;

export const TextShadow = `
  text-shadow: 0px 2px 5px rgba(236, 237, 237, 0.4),
  0px 0px 5px rgba(142, 147, 148, 0.2);
`;

export const Card = (padding = '32px', margin = '0') => `
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  width: 100%;
  border-radius: 4px;
  padding: ${padding};
  margin: ${margin};
  background-color: white;
`;

export const FadeInAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;
