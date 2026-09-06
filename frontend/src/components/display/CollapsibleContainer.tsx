import React, { ReactNode, useState } from 'react';
import Collapsible from 'react-collapsible';

import {
  Chevron,
  ContainerWrapper,
  ContentWrapper,
  HeaderChevronBox,
  HeaderTitle,
  HeaderWrapper,
} from './styles/CollapsibleContainer';

type CollapsibleContainerProps = {
  children: ReactNode;
  title: string;
  bigTitle?: boolean;
  centerHeader?: boolean;
  headerBorder?: boolean;
  isInitiallyOpen?: boolean;
  margin?: string;
};

const CollapsibleContainer = ({
  title,
  children,
  isInitiallyOpen = true,
  centerHeader = true,
  headerBorder = false,
  bigTitle = false,
  margin = '32px 0 0 0',
}: CollapsibleContainerProps) => {
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);
  return (
    <ContainerWrapper margin={margin}>
      <HeaderWrapper headerBorder={isOpen && headerBorder}>
        <HeaderTitle centerHeader={centerHeader} bigTitle={bigTitle}>
          {title}
        </HeaderTitle>
        <HeaderChevronBox
          onClick={() => setIsOpen(!isOpen)}
          onMouseDown={(e) => e.preventDefault()}
        >
          <Chevron open={isOpen} />
        </HeaderChevronBox>
      </HeaderWrapper>
      <Collapsible
        open={isOpen}
        transitionTime={300}
        easing="ease-in-out"
        trigger=""
        triggerDisabled={true}
      >
        <ContentWrapper>{children}</ContentWrapper>
      </Collapsible>
    </ContainerWrapper>
  );
};

export default CollapsibleContainer;
