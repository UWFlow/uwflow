import FadeIn from 'react-fade-in';
import styled from 'styled-components';

export const ModalChildren = styled(FadeIn)`
  position: relative;
  margin: 4px;
`;

export const ModalX = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  height: 24px;
  width: 24px;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  z-index: 1;
  color: ${({ theme }) => theme.dark3};

  &:hover {
    color: ${({ theme }) => theme.dark1};
  }
`;
