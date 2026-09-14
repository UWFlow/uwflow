import React, {
  Dispatch,
  SetStateAction,
  SyntheticEvent,
  useState,
} from 'react';

import Button from 'components/input/Button';
import Textbox from 'components/input/Textbox';
import { BACKEND_ENDPOINT, EMAIL_AUTH_LOGIN_ENDPOINT } from 'constants/Api';
import { AUTH_FORM_ERRORS } from 'constants/Messages';
import { EmailAuthLoginBody } from 'types/Api';
import { validateEmail } from 'utils/Email';

import {
  Error,
  ForgotPasswordText,
  ForgotPasswordWrapper,
  Form,
  FormError,
  Header,
  TextboxWrapper,
} from './styles/AuthForm';
import { AuthFormState, HandleAuthFunction } from './AuthTypes';

type LoginContentProps = {
  handleAuth: HandleAuthFunction;
  formState: AuthFormState;
  setEmail: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
  onShowResetPassword: () => void;
};

const LoginContent = ({
  handleAuth,
  formState,
  setEmail,
  setPassword,
  onShowResetPassword,
}: LoginContentProps) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const validateFields = () => {
    const emailValid = validateEmail(formState.email);
    setEmailError(!emailValid);
    setPasswordError(formState.password === '');
    return emailValid && formState.password !== '';
  };

  const handleLogin = async (event: SyntheticEvent<EventTarget>) => {
    await handleAuth<EmailAuthLoginBody>(
      event,
      `${BACKEND_ENDPOINT}${EMAIL_AUTH_LOGIN_ENDPOINT}`,
      {
        email: formState.email,
        password: formState.password,
      },
      setErrorMessage,
      validateFields,
    );
  };

  return (
    <>
      <Header>Log in</Header>
      <Form onSubmit={handleLogin}>
        {emailError && <FormError>{AUTH_FORM_ERRORS.invalid_email}</FormError>}
        {passwordError && (
          <FormError>{AUTH_FORM_ERRORS.empty_password}</FormError>
        )}
        {errorMessage && <Error>{errorMessage}</Error>}
        <TextboxWrapper>
          <Textbox
            options={{ width: '100%', type: 'email' }}
            placeholder="Email"
            error={emailError}
            text={formState.email}
            setText={(value) => {
              setEmail(value);
              setEmailError(false);
            }}
          />
        </TextboxWrapper>
        <TextboxWrapper>
          <Textbox
            options={{ width: '100%', type: 'password' }}
            placeholder="Password"
            error={passwordError}
            text={formState.password}
            setText={(value) => {
              setPassword(value);
              setPasswordError(false);
            }}
          />
        </TextboxWrapper>
        <ForgotPasswordWrapper>
          <ForgotPasswordText onClick={onShowResetPassword}>
            Forgot password?
          </ForgotPasswordText>
        </ForgotPasswordWrapper>
        <Button
          margin="0 0 16px 0"
          width="100%"
          onClick={handleLogin}
          type="submit"
        >
          Log in
        </Button>
      </Form>
    </>
  );
};

export default LoginContent;
