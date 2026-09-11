import styled from 'styled-components';
import breakpoint from 'styled-components-breakpoint';

import {
  PageContent,
  PageWrapper,
  ThinColumn,
  WideColumn,
} from 'constants/Mixins';

export const ProfPageWrapper = styled.div`
  ${PageWrapper}
  background-color: ${({ theme }) => theme.light1};
`;

export const ColumnWrapper = styled.div`
  ${PageContent}
  display: flex;
  flex-flow: row wrap;
`;

export const Column1 = styled.div`
  ${WideColumn}

  ${breakpoint('zero', 'tablet')`
    width: 100%;
    padding: 0;
    order: 2;
  `}
`;

export const Column2 = styled.div`
  ${ThinColumn}

  ${breakpoint('zero', 'tablet')`
    width: 100%;
    order: 1;
  `}
`;
