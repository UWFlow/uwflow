import styled from 'styled-components';

import {
  Body,
  BoxShadow,
  DarkBoxShadow,
  FadeInAnimation,
  Hover,
} from 'constants/Mixins';

export const SearchBarWrapper = styled.div<{ isLanding: boolean }>`
  ${({ isLanding }) => isLanding && DarkBoxShadow}
  position: relative;
  width: 100%;
  z-index: 1;
`;

export const SearchResultsWrapper = styled.div<{ maximizeWidth: boolean }>`
  position: absolute;
  width: 100%;
  background: ${({ theme }) => theme.white};
  ${BoxShadow}
  border-radius:  0 0 4px 4px;
  z-index: 1;

  ${({ maximizeWidth }) =>
    maximizeWidth
      ? `@media only screen and (max-width: 425px) {
      width: 100vw;
      margin-top: 16px;
      margin-left: -17px; // including border 1px
    }`
      : ''}
`;

export const SearchResult = styled.button<{ isLanding: boolean }>`
  ${Body}
  position: relative;
  border: none;
  cursor: pointer;
  display: flex;
  background: ${({ theme }) => theme.white};
  color: ${({ theme }) => theme.dark3};
  padding: 8px 16px;
  min-width: 100%;
  max-width: 100%;
  height: 48px;
  border-bottom: 1px solid ${({ theme }) => theme.light3};
  animation: ${FadeInAnimation} 0.2s;
  outline: none;

  ${({ isLanding, theme }) =>
    isLanding
      ? `&:first-child {
    border-top: 1px solid ${theme.light3};
  }`
      : ''};

  &:last-child {
    border-radius: 0 0 4px 4px;
    border-bottom: none;
  }

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.light1} !important;
    border-bottom: none;
  }

  &:hover span,
  &:focus span {
    color: ${({ theme }) => theme.light1} !important;
    filter: brightness(100%) !important;
  }

  &:hover .primaryicon {
    color: ${({ theme }) => theme.light1} !important;
  }
`;

export const ResultIcon = styled.div<{ color: string }>`
  display: flex;
  flex: 1;
  align-items: center;
  margin: auto;
  margin-right: 16px;
  max-width: 24px;
  color: ${({ color }) => color};
`;

export const ResultText = styled.div`
  display: flex;
  flex-grow: 1;
  margin: auto;
  overflow: hidden;
`;

export const EllipsisSpan = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ColoredResultText = styled.span<{ color: string }>`
  color: ${({ color }) => color};
  font-weight: 600;
  width: max-content;
  transition: 0.2s all;
  white-space: nowrap;
`;

export const Dash = styled.span`
  margin: 0 4px;
`;

export const ExploreSideButton = styled.div<{ color: string }>`
  display: flex;
  cursor: pointer;
  border-radius: 50%;
  margin-left: 16px;
  height: 32px;
  width: 32px;
  min-width: 32px;
  align-items: center;
  justify-content: center;
  background: ${({ color }) => color};
  ${Hover()}
  color: ${({ theme }) => theme.white};

  svg {
    width: 20px;
    min-width: 20px;
    height: 20px;
  }
`;

export const UnderlinedText = styled.span`
  text-decoration: underline;
  transition: 0.1s filter;
`;

export const BoldText = styled.span`
  font-weight: 500;
`;

export const ShortcutBadge = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  color: ${({ theme }) => theme.dark3};
  background: ${({ theme }) => theme.light1};
  border: 1px solid ${({ theme }) => theme.light3};
  border-radius: 4px;
  padding: 2px 6px;
  user-select: none;
  white-space: nowrap;

  @media only screen and (max-width: 768px) {
    display: none;
  }
`;
