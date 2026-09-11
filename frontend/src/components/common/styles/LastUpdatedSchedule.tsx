import styled from 'styled-components';
import breakpoint from 'styled-components-breakpoint';

import { Body, Hover, Link } from 'constants/Mixins';

export const LastUpdatedText = styled.div<{
  margin: string;
  fontSize?: string;
}>`
  ${Body}
  color: ${({ theme }) => theme.dark3};
  margin: ${({ margin }) => margin};
  ${({ fontSize }) => fontSize && `font-size: ${fontSize};`}

  ${breakpoint('zero', 'tablet')`
    padding: 0 16px;
  `}
`;

export const LastUpdatedLink = styled.a`
  ${Link}
  font-size: inherit;
  color: ${({ theme }) => theme.dark3};
  ${Hover()}
`;
