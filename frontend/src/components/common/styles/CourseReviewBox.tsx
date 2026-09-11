import styled from 'styled-components';

import {
  Body,
  BoxShadow,
  Card,
  Heading3,
  Heading4,
  Hover,
} from 'constants/Mixins';

const MODAL_WIDTH = 660;

export const CourseReviewBoxWrapper = styled.div`
  ${Card('24px', '0')}
  ${BoxShadow}
  width: ${MODAL_WIDTH}px;
`;

export const QuestionText = styled.div`
  ${Heading4}
  white-space: nowrap;
`;

export const SliderOptionText = styled.div`
  ${Body}
  color: ${({ theme }) => theme.dark2};
  font-weight: 600;
  margin-left: 40px;
  margin-bottom: 40px;
`;

export const ReviewTextArea = styled.textarea<{ rows: number }>`
  padding: 8px 16px;
  background: ${({ theme }) => theme.light2};
  width: 100%;
  margin: 0 0 40px 0;
  border-radius: 4px;
  border: none;
  height: ${({ rows }) => rows * 16}px;
  resize: none;
  ${BoxShadow}
  ${Body}
  transition: 0.2s all;

  &:disabled {
    color: ${({ theme }) => theme.light4};
  }
`;

export const MetricQuestionWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const MetricQuestionText = styled.div<{ width?: number }>`
  ${Body}
  width: ${({ width = 112 }) => width}px;
  min-width: ${({ width = 112 }) => width}px;
  margin-bottom: 40px;
  position: relative;
`;

export const QuestionWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 40px;
`;

export const Footer = styled.div`
  display: flex;
  position: relative;
  justify-content: space-between;
  align-items: center;
`;

export const DeleteIconWrapper = styled.button`
  display: flex;
  border-radius: 4px;
  padding: 4px;
  background: ${({ theme }) => theme.white};
  border: 2px solid ${({ theme }) => theme.red};
  cursor: pointer;
  ${Hover()}
`;

export const FooterQuestionWrapper = styled.div`
  right: 0;
  display: flex;
  align-items: center;
`;

export const LightText = styled.div`
  color: ${({ theme }) => theme.white};
  ${Heading4}
  font-weight: 400;
`;

export const DeleteReviewModalWrapper = styled.div`
  ${Card()}
  padding-right: 40px;
  color: ${({ theme }) => theme.dark1};
  ${Heading3}
`;

export const DeleteConfirmButtons = styled.div`
  display: flex;
  flex-direction: flex-end;
  margin-top: 16px;
`;
