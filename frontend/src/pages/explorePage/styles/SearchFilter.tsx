import styled from 'styled-components';
import breakpoint from 'styled-components-breakpoint';

import { Body, BoxShadow, Card, Heading3, Heading4 } from 'constants/Mixins';

export const SearchFilterWrapper = styled.div`
  ${Card('40px 32px')}
  ${BoxShadow}
  margin-bottom: 32px;

  ${breakpoint('zero', 'tablet')`
    padding: 24px 16px;
  `}
`;

export const SearchFilterHeader = styled.div`
  ${Heading3}
  color: ${({ theme }) => theme.dark1};
  margin-bottom: 24px;
`;

export const SearchFilterText = styled.div`
  ${Heading4}
  color: ${({ theme }) => theme.dark2};
  margin-bottom: 8px;
`;

export const SearchFilterSection = styled.div`
  display: block;
`;

export const RadioButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
`;

export const CourseFilterDropdown = styled.span`
  position: absolute;
`;

export const NumRatingsText = styled.span`
  ${Body}
  color: ${({ theme }) => theme.dark3};
  white-space: nowrap;
`;

export const NumRatingsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export const BoldText = styled.span`
  font-weight: 600;
`;

export const HeaderButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
