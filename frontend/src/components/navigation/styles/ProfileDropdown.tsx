import styled from 'styled-components';
import breakpoint from 'styled-components-breakpoint';

import { BoxShadow, DarkBoxShadow, Heading4, Hover } from 'constants/Mixins';

export const ProfileDropdownWrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  outline: 0;
  border: none;
  margin-left: 40px;

  ${breakpoint('zero', 'tablet')`
    margin-left: 24px;
  `}
`;

export const ProfilePicture = styled.button<{
  isLanding: boolean;
  image: string;
}>`
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background-image: url(${({ image }) => image});
  background-size: 40px;
  ${({ isLanding }) => (isLanding ? DarkBoxShadow : BoxShadow)}
  ${Hover()}
`;

export const ProfileText = styled.div<{ isLanding: boolean }>`
  ${Heading4}
  color: white;
  color: ${({ theme, isLanding }) => (isLanding ? theme.white : theme.dark1)};
  text-decoration: none;
  display: flex;
  align-items: center;
  width: max-content;
  z-index: 1;
  white-space: nowrap;

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.primary};
  }
`;
