import { Link as _Link } from 'react-router-dom';
import styled from 'styled-components';

import {
  Body,
  BoxShadow,
  DarkBoxShadow,
  Heading2,
  Heading4,
  Hover,
  Link,
} from 'constants/Mixins';

export const Wrapper = styled.div<{ margin: string }>`
  ${DarkBoxShadow}
  background: white;
  display: flex;
  flex-direction: column;
  margin: ${({ margin }) => margin};
  width: 380px;
  border-radius: 4px;
  height: fit-content;

  @media only screen and (max-width: 400px) {
    max-width: 90vw;
    min-width: 320px;
  }
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 32px;
  align-items: center;
`;

export const Header = styled.div`
  ${Heading2}
  margin-bottom: 24px;
  align-self: flex-start;
`;

export const TextboxWrapper = styled.div`
  margin-bottom: 16px;
  width: 100%;
`;

export const Spacer = styled.div`
  width: 16px;
`;

export const NamesSection = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const ForgotPasswordWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
`;

export const ForgotPasswordText = styled.div`
  color: ${({ theme }) => theme.dark1};
  cursor: pointer;
  ${Hover(true)}
`;

export const OrWrapper = styled.div`
  ${Heading4}
  margin-bottom: 16px;
  color: ${({ theme }) => theme.dark1};
`;

export const PrivacyWrapper = styled.div`
  display: flex;
  margin-top: 16px;
`;

export const GreyText = styled.div`
  color: ${({ theme }) => theme.dark3};
  ${Body}
  font-size: 14px;
`;

export const PrivacyPolicyText = styled(_Link)`
  ${Body}
  font-size: 14px;
  color: ${({ theme }) => theme.dark1};
  margin-left: 4px;
`;

export const SwapModalWrapper = styled.div`
  ${Heading4}
  color: ${({ theme }) => theme.dark1};
  font-weight: 300;
  width: 100%;
  border-top: 1px solid ${({ theme }) => theme.light3};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
`;

export const SwapModalLink = styled.button`
  ${Link}
  background: none;
  padding: 0;
  border: none;
  color: ${({ theme }) => theme.primary};
  margin-left: 4px;
  ${Heading4}
  font-weight: 300;
  text-decoration: underline;
  cursor: pointer;
`;

export const Error = styled.div`
  ${Body}
  width: 100%;
  background: ${({ theme }) => theme.red};
  color: ${({ theme }) => theme.white};
  padding: 4px 8px;
  margin-bottom: 8px;
  border-radius: 4px;
`;

export const FacebookButton = styled.button<{ isLoading: boolean }>`
  width: 100%;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  color: ${({ theme }) => theme.white};
  background-color: ${({ theme }) => theme.facebook};
  display: flex;
  flex-direction: row;
  align-items: center;
  text-align: center;
  ${BoxShadow}
  ${Hover()}
`;

export const FacebookIcon = styled.div`
  font-size: 32px;
  height: max-content;
`;

export const GoogleButton = styled.button<{ isLoading: boolean }>`
  margin-top: 16px;
  width: 100%;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  color: ${({ theme }) => theme.white};
  background-color: ${({ theme }) => theme.google};
  display: flex;
  flex-direction: row;
  align-items: center;
  text-align: center;
  ${BoxShadow}
  ${Hover()}
`;

export const GoogleIcon = styled.div`
  font-size: 32px;
  height: max-content;
`;

export const ButtonText = styled.div`
  ${Heading4}
  font-weight: 400;
  display: flex;
  flex: 1;
  justify-content: center;
`;

export const Form = styled.form`
  width: 100%;
`;

export const FormError = styled.div`
  border-radius: 4px;
  background: ${({ theme }) => theme.red};
  color: ${({ theme }) => theme.white};
  padding: 4px 8px;
  margin-bottom: 8px;
`;
