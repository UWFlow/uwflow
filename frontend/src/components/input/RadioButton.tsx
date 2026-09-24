import React from 'react';

import {
  RadioButtonOption,
  RadioButtonText,
  RadioButtonWrapper,
} from './styles/RadioButton';
import CheckCircle from './CheckCircle';

type RadioButtonProps = {
  color: string;
  options: string[];
  selected: number | boolean;
  margin?: string;
  onClick?: (selectedIndex: number) => void;
  toggle?: boolean;
};

const RadioButton = ({
  color,
  options,
  selected,
  margin = '0 0 40px 0',
  toggle = false,
  onClick = () => {},
}: RadioButtonProps) => {
  return (
    <RadioButtonWrapper margin={margin}>
      {options.map((opt, idx) => (
        <RadioButtonOption key={idx}>
          <CheckCircle
            color={color}
            disabled={false}
            checked={
              Boolean(toggle && selected) ||
              Boolean(!toggle && idx === selected)
            }
            onClick={() => onClick(idx)}
          />
          <RadioButtonText>{opt}</RadioButtonText>
        </RadioButtonOption>
      ))}
    </RadioButtonWrapper>
  );
};

export default RadioButton;
