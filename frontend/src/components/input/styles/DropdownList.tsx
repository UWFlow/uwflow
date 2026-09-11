import styled from 'styled-components';

import { BoxShadow, Heading4, Hover } from 'constants/Mixins';

export const ITEM_HEIGHT = 56;

export const DropdownWrapper = styled.div<{
  zIndex: number;
  width: string;
  margin: string;
}>`
  color: ${({ color }) => color};
  z-index: ${({ zIndex }) => zIndex};
  width: ${({ width }) => width};
  margin: ${({ margin }) => margin};
  margin-left: 4px;
  width: fit-content;
  white-space: nowrap;
  cursor: pointer;
  position: relative;
  user-select: none;
`;

export const DropdownControl = styled.button<{ open: boolean }>`
  background: none;
  border: none;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: ${({ theme, open, color }) => (open ? theme.light3 : color)};
  ${Heading4}
  ${Hover(true)}
`;

export const DropdownMenu = styled.div<{ open: boolean; menuOffset: number }>`
  display: flex;
  display: ${({ open }) => (open ? 'block' : 'none')};
  position: absolute;
  border-radius: 4px;
  top: calc(100% + ${({ menuOffset }) => menuOffset}px);
  right: 0;
  width: fit-content;
  white-space: nowrap;
  background-color: ${({ theme }) => theme.white};
  z-index: 8;
  overflow: none;
  margin-bottom: 32px;

  input {
    border-radius: 4px 4px 0 0 !important;
  }

  ${BoxShadow}
`;

export const MenuItem = styled.button<{
  selected: boolean;
  itemColor?: string;
}>`
  outline: none;
  border: none;
  display: block;
  cursor: pointer;
  width: 100%;
  text-align: left;
  height: ${ITEM_HEIGHT}px;

  color: ${({ theme, selected, itemColor }) =>
    itemColor || (selected ? theme.white : theme.dark2)};
  background-color: ${({ theme, selected }) =>
    selected ? theme.primary : theme.white};
  padding: 16px;
  border-radius: 0;
  border: 1px solid ${({ theme }) => theme.light1};
  ${Heading4}

  &:first-child {
    border-radius: 4px 4px 0 0;
  }

  &:last-child {
    border-radius: 0 0 4px 4px;
  }

  &:only-child {
    border-radius: 4px;
  }

  ${Hover(true)}
`;

export const MenuSearch = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 100%;
  position: sticky;
  top: 0;
  height: ${ITEM_HEIGHT}px;
  color: ${({ theme }) => theme.primary};
  background-color: ${({ theme }) => theme.light2};
  border-radius: 4px 4px 0 0;
  border: 1px solid ${({ theme }) => theme.light2};
  ${Heading4}
  z-index: 1;

  &:focus {
    ${BoxShadow}
  }
`;
