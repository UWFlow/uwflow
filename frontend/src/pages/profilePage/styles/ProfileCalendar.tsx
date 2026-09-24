import styled from 'styled-components';
import breakpoint from 'styled-components-breakpoint';

import { Body, BoxShadow, Card, Heading2, Heading3 } from 'constants/Mixins';

export const ProfileCalendarWrapper = styled.div`
  ${Card()}
  ${BoxShadow}
  margin-bottom: 32px;

  ${breakpoint('zero', 'tablet')`
    padding: 24px 16px;
  `}
`;

export const ProfileCalendarHeading = styled.div`
  ${Heading2}
  margin-bottom: 16px;
  color: ${({ theme }) => theme.dark1};
`;

export const ProfileCalendarText = styled.div`
  ${Body}
  font-size: 20px;
  font-weight: 300;
  margin-bottom: 32px;
  color: ${({ theme }) => theme.dark2};
`;

export const CalendarWithButtonsWrapper = styled.div`
  background-color: ${({ theme }) => theme.white};
  border-radius: 4px;
  margin-bottom: 32px;
  ${BoxShadow}
`;

export const ExportCalendarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 32px;
  border-bottom: 2px solid ${({ theme }) => theme.light3};

  ${breakpoint('zero', 'tablet')`
    padding: 32px 16px;
  `}
`;

export const ExportCalendarText = styled.div`
  ${Heading2}
  line-height: 1.5;
  margin-right: 4px;
  color: ${({ theme }) => theme.dark1};
`;

export const RecentCalendarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 24px;

  ${breakpoint('zero', 'tablet')`
    padding: 24px 16px;
  `}

  @media only screen and (max-width: 500px) {
    flex-direction: column;
  }
`;

export const RecentCalendarText = styled.div`
  ${Heading3}
  display: flex;
  align-items: center;
  margin-right: 4px;

  @media only screen and (max-width: 500px) {
    margin-bottom: 16px;
  }
`;

export const ButtonWrapper = styled.div`
  max-width: fit-content;

  @media only screen and (max-width: 500px) {
    max-width: 100%;
  }
`;
