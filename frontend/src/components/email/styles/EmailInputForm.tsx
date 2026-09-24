import styled from 'styled-components';

import { BoxShadow, Heading2 } from 'constants/Mixins';

export const EmailInputFormWrapper = styled.form`
  ${BoxShadow}
  display: flex;
  flex-direction: column;
  padding: 32px;
  background: white;
  width: 400px;
  border-radius: 4px;
  max-width: 95vw;
  min-width: 300px;
`;

export const FormTitle = styled.div`
  ${Heading2}
  margin-bottom: 24px;
`;

export const TextboxWrapper = styled.div`
  margin-bottom: 16px;
`;

export const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const FormText = styled.div`
  margin-bottom: 16px;
`;

export const FormLink = styled.a`
  text-decoration: underline;
  cursor: pointer;
`;
