import { ChevronDown } from 'react-feather';
import styled from 'styled-components';

import { BoxShadow, Heading2, Heading3, Hover } from 'constants/Mixins';

const HEADER_HEIGHT = 64;

export const ContainerWrapper = styled.div<{ margin: string }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  ${BoxShadow}
  margin:  ${({ margin }) => margin};
  border-radius: 4px;
  max-width: 100vw;
`;

export const HeaderWrapper = styled.div<{ headerBorder: boolean }>`
  display: flex;
  height: ${HEADER_HEIGHT}px;
  justify-content: space-between;
  border-bottom: ${({ headerBorder, theme }) =>
    headerBorder ? `2px solid ${theme.light1}` : 'none'};
  border-radius: 4px 4px 0 0;
`;

export const HeaderTitle = styled.div<{
  bigTitle: boolean;
  centerHeader: boolean;
}>`
  ${({ bigTitle }) => (bigTitle ? Heading2 : Heading3)}
  ${({ bigTitle }) => (bigTitle ? '' : '')}
  display: flex;
  align-items: center;
  justify-content: ${({ centerHeader }) =>
    centerHeader ? 'center' : 'flex-begin'};
  padding-left: 16px;
  background: ${({ theme }) => theme.white};
  width: 100%;
  border-radius: 4px 4px 0 0;
`;

export const HeaderChevronBox = styled.button`
  width: ${HEADER_HEIGHT}px;
  height: ${HEADER_HEIGHT}px;
  border-top-right-radius: 4px;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: ${({ theme }) => theme.light3};
  color: ${({ theme }) => theme.dark2};
  ${Hover()}
`;

export const Chevron = styled(ChevronDown)<{ open: boolean }>`
  ${({ open }) => (open ? '' : 'transform: rotate(180deg);')}
  transition: all .3s ease-in-out;
`;

export const ContentWrapper = styled.div`
  background: ${({ theme }) => theme.white};
  border-radius: 0 0 4px 4px;
`;
