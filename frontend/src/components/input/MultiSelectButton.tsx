import React, { ReactNode } from 'react';

import {
  ButtonWrapper,
  MultiSelectButtonWrapper,
} from './styles/MultiSelectButton';

type MultiSelectButtonProps = {
  options: ReactNode[];
  selected: boolean[];
  margin?: string;
  onClick?: (selectedIndex: number) => void;
};

const MultiSelectButton = ({
  options,
  selected,
  margin = '0 0 32px 0',
  onClick = () => null,
}: MultiSelectButtonProps) => {
  return (
    <MultiSelectButtonWrapper margin={margin}>
      {options.map((option, idx) => (
        <ButtonWrapper
          selected={selected[idx]}
          onClick={() => onClick(idx)}
          key={idx}
        >
          {option}
        </ButtonWrapper>
      ))}
    </MultiSelectButtonWrapper>
  );
};

export default MultiSelectButton;
