import FadeIn from 'react-fade-in';
import styled from 'styled-components';
import breakpoint from 'styled-components-breakpoint';

import {
  BoxShadow,
  PageContent,
  PageWrapper,
  ThinColumn,
  WideColumn,
} from 'constants/Mixins';

export const ProfilePageWrapper = styled.div`
  ${PageWrapper}
`;

export const ColumnWrapper = styled.div`
  ${PageContent}
  display: flex;
  flex-flow: row wrap;
`;

export const Column1 = styled(FadeIn)`
  ${WideColumn}

  ${breakpoint('zero', 'tablet')`
    width: 100%;
    padding: 0;
    order: 2;
  `}
`;

export const Column2 = styled(FadeIn)`
  ${ThinColumn}

  ${breakpoint('zero', 'tablet')`
    width: 100%;
    order: 1;
  `}
`;

export const CompleteProfileWrapper = styled.div`
  width: 100%;
  padding: 32px;
  padding-bottom: 1px;
  margin-bottom: 32px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.white};
  ${BoxShadow}
`;
