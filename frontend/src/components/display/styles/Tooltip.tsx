import Tippy from '@tippyjs/react';
import styled from 'styled-components';

import { Body } from 'constants/Mixins';

import 'tippy.js/dist/tippy.css';

export const TooltipWrapper = styled(Tippy)`
  ${Body}
  background: ${({ theme }) => theme.light1} !important;
  border: 2px solid ${({ theme }) => theme.light3};
  padding: 2px;
  border-radius: 4px !important;
  max-width: 200px;
  color: ${({ theme }) => theme.dark1} !important;
  white-space: normal;
  opacity: 0.98;
  font-size: 16px !important;

  &:after {
    display: none;
  }
`;
