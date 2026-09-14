import React, {
  Dispatch,
  SetStateAction,
  SyntheticEvent,
  useState,
} from 'react';

import Button from 'components/input/Button';
import Textbox from 'components/input/Textbox';
import { BACKEND_ENDPOINT, EMAIL_AUTH_REGISTER_ENDPOINT } from 'constants/Api';
import { MIN_PASSWORD_LENGTH } from 'constants/Auth';
import { AUTH_FORM_ERRORS } from 'constants/Messages';
import { validateEmail } from 'utils/Email';

import {
  Error,
  Form,
  FormError,
  Header,
  NamesSection,
  Spacer,
  TextboxWrapper,
} from './styles/AuthForm';
import { AuthFormState, HandleAuthFunction } from './AuthTypes';

type SignupContentProps = {
  handleAuth: HandleAuthFunction;
  formState: AuthFormState;
  setFirstName: Dispatch<SetStateAction<string>>;
  setLastName: Dispatch<SetStateAction<string>>;
  setEmail: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
  setConfirmPassword: Dispatch<SetStateAction<string>>;
};

const SignupContent = ({
  handleAuth,
  formState,
  setFirstName,
  setLastName,
  setEmail,
  setPassword,
  setConfirmPassword,
}: SignupContentProps) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);

  const transformName = (name: string) => {
    if (name === '') {
      return name;
    }
    return name[0].toUpperCase() + name.slice(1);
  };

  const validateFields = () => {
    const emailValid = validateEmail(formState.email);
    setFirstNameError(formState.firstName === '');
    setLastNameError(formState.lastName === '');
    setEmailError(!emailValid);
    setPasswordError(formState.password.length < MIN_PASSWORD_LENGTH);
    setConfirmPasswordError(formState.password !== formState.confirmPassword);

    return (
      emailValid &&
      formState.firstName !== '' &&
      formState.lastName !== '' &&
      formState.password.length >= MIN_PASSWORD_LENGTH &&
      formState.password === formState.confirmPassword
    );
  };

  const handleSignUp = async (event: SyntheticEvent<EventTarget>) => {
    await handleAuth(
      event,
      `${BACKEND_ENDPOINT}${EMAIL_AUTH_REGISTER_ENDPOINT}`,
      {
        first_name: transformName(formState.firstName),
        last_name: transformName(formState.lastName),
        email: formState.email,
        password: formState.password,
      },
      setErrorMessage,
      validateFields,
    );
  };

  return (
    <>
      <Header>Sign up</Header>
      <Form onSubmit={handleSignUp}>
        {firstNameError && (
          <FormError>{AUTH_FORM_ERRORS.empty_first_name}</FormError>
        )}
        {lastNameError && (
          <FormError>{AUTH_FORM_ERRORS.empty_last_name}</FormError>
        )}
        {emailError && <FormError>{AUTH_FORM_ERRORS.invalid_email}</FormError>}
        {passwordError && (
          <FormError>{AUTH_FORM_ERRORS.password_too_short}</FormError>
        )}
        {confirmPasswordError && (
          <FormError>{AUTH_FORM_ERRORS.passwords_dont_match}</FormError>
        )}
        {errorMessage && <Error>{errorMessage}</Error>}
        <NamesSection>
          <TextboxWrapper>
            <Textbox
              options={{ width: '100%', name: 'firstname' }}
              placeholder="First Name"
              error={firstNameError}
              text={formState.firstName}
              setText={(value) => {
                setFirstName(value);
                setFirstNameError(false);
              }}
            />
          </TextboxWrapper>
          <Spacer />
          <TextboxWrapper>
            <Textbox
              options={{ width: '100%', name: 'lastname' }}
              placeholder="Last Name"
              error={lastNameError}
              text={formState.lastName}
              setText={(value) => {
                setLastName(value);
                setLastNameError(false);
              }}
            />
          </TextboxWrapper>
        </NamesSection>
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
              setPasswordError(
                passwordError &&
                  formState.password.length < MIN_PASSWORD_LENGTH,
              );
            }}
          />
        </TextboxWrapper>
        <TextboxWrapper>
          <Textbox
            options={{ width: '100%', type: 'password' }}
            placeholder="Confirm Password"
            error={confirmPasswordError}
            text={formState.confirmPassword}
            setText={(value) => {
              setConfirmPassword(value);
              setConfirmPasswordError(
                confirmPasswordError && value !== formState.password,
              );
            }}
          />
        </TextboxWrapper>
        <Button
          margin="0 0 16px 0"
          width="100%"
          handleClick={handleSignUp}
          type="submit"
        >
          Sign Up
        </Button>
      </Form>
    </>
  );
};

export default SignupContent;
