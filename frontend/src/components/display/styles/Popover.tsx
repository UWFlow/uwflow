import Tippy from '@tippyjs/react';
import styled from 'styled-components';

import { Body } from 'constants/Mixins';

import 'tippy.js/dist/tippy.css';

export const PopoverWrapper = styled(Tippy)`
  ${Body}
  background: ${({ theme }) => theme.light1} !important;
  box-shadow: inset 0 0 0 5px ${({ theme }) => theme.light3};
  color: ${({ theme }) => theme.dark1} !important;
  opacity: 0.98;

  /* Style the arrow */
  .tippy-arrow {
    color: ${({ theme }) => theme.light3}; /* Border color */
  }

  /* Style the arrow's inner fill */
  .tippy-arrow:before {
    color: ${({ theme }) => theme.light3}; /* Border color */
  }
`;
