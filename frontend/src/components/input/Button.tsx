import React, { ComponentProps, MouseEvent, ReactNode } from 'react';
import { useTheme } from 'styled-components';

import LoadingSpinner from 'components/display/LoadingSpinner';

import { ButtonText, ButtonWrapper } from './styles/Button';

type ButtonProps = ComponentProps<'button'> & {
  children: ReactNode;
  borderColor?: string;
  color?: string;
  handleClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  hasShadow?: boolean;
  height?: number;
  loading?: boolean;
  margin?: string;
  maxHeight?: string;
  padding?: string;
  width?: string;
};

const Button = ({
  children,
  color,
  borderColor,
  width = 'auto',
  margin = '0',
  padding = '8px 32px',
  handleClick = () => null,
  height = 48,
  maxHeight = '100%',
  hasShadow = true,
  loading = false,
  disabled = false,
  type = 'button',
}: ButtonProps) => {
  const theme = useTheme();

  return (
    <ButtonWrapper
      height={height}
      disabled={disabled}
      color={color}
      borderColor={borderColor}
      hasShadow={hasShadow}
      margin={margin}
      maxHeight={maxHeight}
      padding={padding}
      width={width}
      type={type}
      onClick={disabled ? () => null : handleClick}
      onMouseDown={(e) => e.preventDefault()}
    >
      {loading ? (
        <LoadingSpinner
          margin={'auto'}
          size={28}
          strokeWidth={2}
          spinnerColor={theme.dark2}
          backgroundColor={theme.white}
        />
      ) : (
        <ButtonText>{children}</ButtonText>
      )}
    </ButtonWrapper>
  );
};

export default Button;
