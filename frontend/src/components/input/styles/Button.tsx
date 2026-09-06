import styled from 'styled-components';

import { BoxShadow, Heading4, Hover } from 'constants/Mixins';

export const ButtonWrapper = styled.button<{
  disabled: boolean;
  hasShadow: boolean;
  height: number;
  margin: string;
  maxHeight: string;
  padding: string;
  width: string;
  borderColor?: string;
  color?: string;
}>`
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};
  display: flex;
  align-items: center;
  text-align: center;
  border: ${({ borderColor }) =>
    borderColor ? `2px solid ${borderColor}` : 'none'};
  border-radius: 8px;
  padding: ${({ padding }) => padding};
  color: ${({ theme, disabled }) => (disabled ? theme.light1 : theme.dark1)};
  min-height: ${({ height }) => height}px;
  max-height: ${({ maxHeight }) => maxHeight};
  margin: ${({ margin }) => margin};
  background: ${({ theme, color = theme.accent, disabled = false }) =>
    disabled ? theme.light4 : color};
  ${({ hasShadow }) => hasShadow && BoxShadow}
  max-width: 100%;
  width: ${({ width }) => width || 'auto'};

  ${Hover()}

  :hover {
    background: ${({ theme, disabled }) => disabled && theme.light4};
  }

  :focus {
    color: ${({ theme }) => theme.dark2};
  }
`;

export const ButtonText = styled.div`
  margin: auto;
  width: max-content;
  ${Heading4}
`;
