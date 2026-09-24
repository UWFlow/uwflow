import styled from 'styled-components';

export const ProgressBarWrapper = styled.div`
  width: 100%;
  height: 16px;
  display: flex;
  margin: 10px 8px 10px 0;
  background-color: ${({ theme }) => theme.light3};
  border-radius: 4px;
  box-shadow: 0px 2px 5px rgba(236, 237, 237, 0.5),
    0px 0px 5px rgba(142, 147, 148, 0.2);
`;

export const Complete = styled.span<{ width: number }>`
  transition: width 1s ease-in-out;
  border-radius: ${({ width }) => (width >= 100 ? '4px' : '4px 0 0 4px')};
  width: ${({ width }) => width}%;
  height: 100%;
  background-color: ${({ theme }) => theme.primary};
`;
