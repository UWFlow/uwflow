import styled from 'styled-components';

import { Body, Heading2 } from 'constants/Mixins';

export const FormWrapper = styled.form`
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  background: white;
  width: 350px;
  border-radius: 4px;
`;

export const Header = styled.div`
  ${Heading2}
  margin-bottom: 16px;
`;

export const Text = styled.div`
  ${Body}
  margin-bottom: 16px;
`;

export const TextboxWrapper = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
`;

export const GreyLink = styled.div`
  ${Body}
  text-decoration: underline;
  color: ${({ theme }) => theme.dark3};
  align-self: flex-end
  margin-top: 4px;
  cursor: pointer;
`;

export const LoadingSpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

export const Error = styled.div`
  ${Body}
  color: ${({ theme }) => theme.red};
  margin-bottom: 16px;
  width: 100%;
`;

export const Success = styled.div`
  ${Body}
  color: ${({ theme }) => theme.professors};
  margin-bottom: 16px;
  width: 100%;
`;
