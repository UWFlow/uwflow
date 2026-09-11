import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { LAB, LEC } from 'constants/CourseSection';
import { Hover } from 'constants/Mixins';

const CELL_HEIGHT = 28;

export const CourseScheduleWrapper = styled.div`
  margin-bottom: 0;
  width: 100%;
`;

export const SectionCellWrapper = styled.div<{ numRows: number }>`
  display: flex;
  position: relative;
  height: calc(
    ${({ numRows }) => numRows}em + ${({ numRows }) => numRows * 4}px
  );
  height: 100%;
  width: 100%;
  align-items: flex-begin;
  padding-left: 20px;
  white-space: nowrap;
`;

export const ColorBar = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 8px;
  background-color: ${({ color, theme }) =>
    color === LEC ? theme.lecture : color === LAB ? theme.lab : theme.tutorial};
`;

export const NormalCellWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-right: 8px;
  transition: 0.2s all;
`;

export const SectionContentWrapper = styled.div`
  display: flex;
  font-weight: 600;
  position: relative;
  align-items: center;
  width: 100%;
  height: ${CELL_HEIGHT}px;
  top: 4px;
`;

export const ContentWrapper = styled.div<{ italics?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  height: ${CELL_HEIGHT}px;
  white-space: nowrap;
  margin-bottom: -8px;
  ${({ italics }) => (italics ? 'font-style: italic;' : '')}
`;

export const InstructorLink = styled(Link)`
  color: ${({ theme }) => theme.professors};
  font-weight: 600;
  white-space: nowrap;
  height: ${CELL_HEIGHT}px;
  display: flex;
  align-items: center;
  margin-bottom: -8px;
  ${Hover()}
`;

export const ScheduleTableWrapper = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
`;

export const EnrollmentText = styled.div<{ hasBell: boolean; filled: boolean }>`
  display: flex;
  align-items: center;
  margin-left: ${({ hasBell = true, filled }) =>
    !filled && hasBell ? 36 : 0}px;
  height: ${CELL_HEIGHT}px;
  color: ${({ theme, filled }) => (filled ? theme.red : 'inherit')};
`;

export const SpaceMargin = styled.div`
  margin-bottom: 16px;
  content: '';
`;

export const GreyWeekDay = styled.span`
  color: ${({ theme }) => theme.dark3};
  margin-right: 2px;
`;

export const BoldWeekDay = styled.span`
  color: ${({ theme }) => theme.dark1};
  font-weight: 700;
  margin-right: 2px;
`;

export const DateText = styled.span`
  margin-left: 4px;
`;
