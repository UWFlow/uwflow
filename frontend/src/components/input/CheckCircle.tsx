import React from 'react';
import { Check } from 'react-feather';

import { CheckCircleWrapper, CheckIcon } from './styles/CheckCircle';

type CheckCircleProps = {
  checked: boolean;
  color: string;
  disabled?: boolean;
  onClick?: () => void;
  width?: number;
};

const CheckCircle = ({
  color,
  checked = false,
  width = 32,
  disabled = true,
  onClick = () => {},
}: CheckCircleProps) => {
  return (
    <CheckCircleWrapper
      onClick={() => (disabled ? null : onClick())}
      disabled={disabled}
      width={width}
      color={color}
      checked={checked}
    >
      {checked ? (
        <CheckIcon>
          <Check color="white" size={24} strokeWidth={3} />
        </CheckIcon>
      ) : null}
    </CheckCircleWrapper>
  );
};

export default CheckCircle;
