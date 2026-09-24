import styled from 'styled-components';

import { TextBoxOptions } from 'types/Common';

export const SearchInputWrapper = styled.div`
  display: block;
  position: relative;
`;

export const SearchInput = styled.input<{
  options: TextBoxOptions;
  error: boolean;
  hasIcon: boolean;
  hasRightElement: boolean;
}>`
  position: relative;
  border: ${({ options, error, theme }) =>
    error
      ? `1px solid ${theme.red}`
      : options.border
      ? options.border
      : 'none'};
  width: ${({ options }) => (options.width ? options.width : '400px')};
  min-width: 152px;
  font-size: inherit;
  padding: ${({ options }) => (options.padding ? options.padding : '8px 16px')};
  border-radius: ${({ options }) =>
    options.borderRadius ? options.borderRadius : '4px'};
  background: ${({ theme }) => theme.light2};
  height: 48px;
  z-index: 2;
  color: ${({ error, theme }) => (error ? theme.red : theme.dark1)};
  background-color: ${({ options }) =>
    options ? options.backgroundColor : ''};
  padding-left: ${({ hasIcon }) => (hasIcon ? '48px' : 'auto')};
  padding-right: ${({ hasRightElement }) =>
    hasRightElement ? '60px' : '16px'};

  // ellipsis for long placeholder
  ${({ value }) =>
    value === ''
      ? `
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `
      : ''}

  &:-ms-input-placeholder {
    color: ${({ error, options, theme }) =>
      error ? theme.red : options ? options.color : theme.dark3};
    font-weight: 400;
  }

  &::-webkit-input-placeholder {
    color: ${({ error, options, theme }) =>
      error ? theme.red : options ? options.color : theme.dark3};
    font-weight: 400;
  }

  &::placeholder {
    color: ${({ error, options, theme }) =>
      error ? theme.red : options ? options.color : theme.dark3};
    font-weight: 400;
  }

  @media only screen and (max-width: 800px) {
    padding-left: ${({ hasIcon }) => (hasIcon ? '56px' : 'auto')};
  }
`;

export const Icon = styled.div`
  position: absolute;
  top: 12px;
  left: 16px;
  z-index: 3;
  color: ${({ theme }) => theme.dark3};

  @media only screen and (max-width: 800px) {
    left: 16px;
  }
`;

export const RightIcon = styled.div`
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  z-index: 3;
  pointer-events: none;
`;
