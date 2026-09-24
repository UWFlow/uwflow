import React, {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  ReactNode,
  RefObject,
} from 'react';

import { TextBoxOptions } from 'types/Common';

import {
  Icon,
  RightIcon,
  SearchInput,
  SearchInputWrapper,
} from './styles/Textbox';

type TextboxProps = {
  placeholder: string;
  setText: (text: string) => void;
  text: string;
  error?: boolean;
  forwardRef?: RefObject<HTMLInputElement>;
  handleKeyDown?: (
    event: KeyboardEvent<HTMLInputElement>,
    text: string,
  ) => void;
  icon?: ReactNode;
  rightElement?: ReactNode;
  maxLength?: number;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  options?: TextBoxOptions;
};

const Textbox = ({
  text,
  setText,
  placeholder,
  icon,
  rightElement,
  error = false,
  handleKeyDown = () => {},
  onFocus = () => {},
  options = {},
  maxLength = 524288, // default browser maxLength,
  forwardRef,
}: TextboxProps) => {
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    handleKeyDown(event, text);
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setText(event.currentTarget.value);
  };

  return (
    <SearchInputWrapper>
      {icon && <Icon>{icon}</Icon>}
      <SearchInput
        type={options.type ? options.type : 'text'}
        value={text}
        placeholder={placeholder}
        onChange={onChange}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        options={options}
        maxLength={maxLength}
        error={error}
        hasIcon={!!icon}
        hasRightElement={!!rightElement}
        ref={forwardRef}
      />
      {rightElement && <RightIcon>{rightElement}</RightIcon>}
    </SearchInputWrapper>
  );
};

export default Textbox;
