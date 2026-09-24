import React, { ReactChild, ReactElement } from 'react';

import { PopoverWrapper } from './styles/Popover';

type PopoverProps = {
  children: ReactElement;
  content: ReactChild;
};

const Popover = ({ children, content }: PopoverProps) => (
  <PopoverWrapper content={content} arrow={true} trigger="click">
    {children}
  </PopoverWrapper>
);

export default Popover;
