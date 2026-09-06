import React, {
  Dispatch,
  SetStateAction,
  SyntheticEvent,
  useState,
} from 'react';
import { toast } from 'react-toastify';

import Button from 'components/input/Button';
import Textbox from 'components/input/Textbox';
import {
  BACKEND_ENDPOINT,
  RESET_PASSWORD_KEY_EMAIL_ENDPOINT,
  RESET_PASSWORD_RESET_PASSWORD_ENDPOINT,
  RESET_PASSWORD_VERIFY_KEY_ENDPOINT,
} from 'constants/Api';
import { MIN_PASSWORD_LENGTH } from 'constants/Auth';
import {
  DEFAULT_ERROR,
  PASSWORD_RESET_SUCCESS,
  RESET_PASSWORD_ERRORS,
} from 'constants/Messages';
import {
  ErrorResponse,
  ResetPasswordCodeBody,
  ResetPasswordEmailBody,
  ResetPasswordNewPasswordBody,
} from 'types/Api';
import { makePOSTRequest } from 'utils/Api';
import { validateEmail } from 'utils/Email';

import {
  Error,
  FormWrapper,
  GreyLink,
  Header,
  Success,
  Text,
  TextboxWrapper,
} from './styles/ResetPasswordModal';

type ResetPasswordFormProps = {
  onSubmit: (event: SyntheticEvent<EventTarget>, email: string) => void;
  loading: boolean;
  error: string;
  success: string;
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  emailError: boolean;
  setEmailError: Dispatch<SetStateAction<boolean>>;
};

const ResetPasswordForm = ({
  onSubmit,
  loading,
  error,
  success,
  email,
  setEmail,
  emailError,
  setEmailError,
}: ResetPasswordFormProps) => {
  return (
    <FormWrapper onSubmit={(event) => onSubmit(event, email)}>
      <Header>Reset Password</Header>
      {error !== '' && <Error>{error}</Error>}
      {success !== '' && <Success>{success}</Success>}
      <TextboxWrapper>
        <Textbox
          options={{ width: '100%', type: 'email' }}
          placeholder="Email"
          error={emailError}
          text={email}
          setText={(value) => {
            setEmail(value);
            setEmailError(false);
          }}
        />
      </TextboxWrapper>
      <Button
        loading={loading}
        width="100%"
        type="submit"
        handleClick={(event) => onSubmit(event, email)}
      >
        Send Reset Email
      </Button>
    </FormWrapper>
  );
};

type EnterResetCodeFormProps = {
  onSubmit: (event: SyntheticEvent<EventTarget>, code: string) => void;
  loading: boolean;
  error: string;
  email: string;
  resendEmail: (event: SyntheticEvent<EventTarget>, email: string) => void;
  success: string;
  codeError: boolean;
  setCodeError: Dispatch<SetStateAction<boolean>>;
};

const EnterResetCodeForm = ({
  onSubmit,
  loading,
  error,
  email,
  resendEmail,
  success,
  codeError,
  setCodeError,
}: EnterResetCodeFormProps) => {
  const [code, setCode] = useState('');

  return (
    <FormWrapper onSubmit={(event) => onSubmit(event, code)}>
      <Header>Enter reset code</Header>
      <Text>
        We just sent you an email with a reset code, please enter it below:
      </Text>
      {error !== '' && <Error>{error}</Error>}
      {success !== '' && <Success>{success}</Success>}
      <TextboxWrapper>
        <Textbox
          options={{ width: '100%' }}
          placeholder="Code"
          error={codeError}
          text={code}
          setText={(value) => {
            setCode(value);
            setCodeError(false);
          }}
        />
        <GreyLink onClick={(event) => resendEmail(event, email)}>
          Send me a new code
        </GreyLink>
      </TextboxWrapper>
      <Button
        loading={loading}
        width="100%"
        handleClick={(event) => onSubmit(event, code)}
      >
        Submit
      </Button>
    </FormWrapper>
  );
};

type EnterNewPasswordFormProps = {
  onSubmit: (
    event: SyntheticEvent<EventTarget>,
    password: string,
    confirmPass: string,
  ) => void;
  loading: boolean;
  error: string;
  success: string;
  passwordError: boolean;
  setPasswordError: Dispatch<SetStateAction<boolean>>;
  confirmPasswordError: boolean;
  setConfirmPasswordError: Dispatch<SetStateAction<boolean>>;
};

const EnterNewPasswordForm = ({
  onSubmit,
  loading,
  error,
  success,
  passwordError,
  setPasswordError,
  confirmPasswordError,
  setConfirmPasswordError,
}: EnterNewPasswordFormProps) => {
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  return (
    <FormWrapper onSubmit={(event) => onSubmit(event, pass, confirmPass)}>
      <Header>Enter new password</Header>
      {error !== '' && <Error>{error}</Error>}
      {success !== '' && <Success>{success}</Success>}
      <TextboxWrapper>
        <Textbox
          options={{ width: '100%', type: 'password' }}
          placeholder="New password"
          error={passwordError}
          text={pass}
          setText={(value) => {
            setPass(value);
            setPasswordError(false);
          }}
        />
      </TextboxWrapper>
      <TextboxWrapper>
        <Textbox
          options={{ width: '100%', type: 'password' }}
          placeholder="Confirm new password"
          error={confirmPasswordError}
          text={confirmPass}
          setText={(value) => {
            setConfirmPass(value);
            setConfirmPasswordError(false);
          }}
        />
      </TextboxWrapper>
      <Button
        loading={loading}
        width="100%"
        handleClick={(event) => onSubmit(event, pass, confirmPass)}
      >
        Reset Password
      </Button>
    </FormWrapper>
  );
};

const RESET_PASSWORD_FORM = 'RESET_PASSWORD';
const ENTER_RESET_CODE_FORM = 'RESET_CODE';
const ENTER_NEW_PASSWORD_FORM = 'NEW_PASSWORD';

export type ResetPasswordModalContentProps = {
  handleClose: () => void;
};

const ResetPasswordModalContent = ({
  handleClose,
}: ResetPasswordModalContentProps) => {
  const [showingForm, setShowingForm] = useState(RESET_PASSWORD_FORM);
  const [savedCode, setSavedCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);

  const handleSendResetEmail = async (
    event: SyntheticEvent<EventTarget>,
    resetEmail: string,
  ) => {
    if (event) {
      event.preventDefault();
    }

    if (!validateEmail(resetEmail)) {
      setEmailError(true);
      setErrorMessage('Please enter a valid email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    const [response, status] = await makePOSTRequest<
      ResetPasswordEmailBody,
      ErrorResponse | object
    >(`${BACKEND_ENDPOINT}${RESET_PASSWORD_KEY_EMAIL_ENDPOINT}`, {
      email: resetEmail,
    });

    setIsLoading(false);
    if (status >= 400) {
      const errorRes = response as ErrorResponse;
      setErrorMessage(RESET_PASSWORD_ERRORS[errorRes.error] || DEFAULT_ERROR);
    } else {
      toast(PASSWORD_RESET_SUCCESS.emailSent);
      if (showingForm !== ENTER_RESET_CODE_FORM) {
        setSuccessMessage('');
        setShowingForm(ENTER_RESET_CODE_FORM);
      } else {
        setSuccessMessage('Successfully sent reset code!');
      }
    }
  };

  const handleSubmitResetCode = async (
    event: SyntheticEvent<EventTarget>,
    code: string,
  ) => {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    const [response, status] = await makePOSTRequest<
      ResetPasswordCodeBody,
      ErrorResponse | object
    >(`${BACKEND_ENDPOINT}${RESET_PASSWORD_VERIFY_KEY_ENDPOINT}`, {
      key: code,
    });

    setIsLoading(false);
    if (status >= 400) {
      const errorRes = response as ErrorResponse;
      setErrorMessage(RESET_PASSWORD_ERRORS[errorRes.error] || DEFAULT_ERROR);
      setCodeError(true);
    } else {
      setSavedCode(code);
      setShowingForm(ENTER_NEW_PASSWORD_FORM);
    }
  };

  const handleNewPassword = async (
    event: SyntheticEvent<EventTarget>,
    newPass: string,
    confirmNewPass: string,
  ) => {
    event.preventDefault();

    if (newPass.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
      setPasswordError(true);
      return;
    }

    if (newPass !== confirmNewPass) {
      setErrorMessage("Passwords don't match.");
      setConfirmPasswordError(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    const [response, status] = await makePOSTRequest<
      ResetPasswordNewPasswordBody,
      ErrorResponse | object
    >(`${BACKEND_ENDPOINT}${RESET_PASSWORD_RESET_PASSWORD_ENDPOINT}`, {
      key: savedCode,
      password: newPass,
    });

    setIsLoading(false);
    if (status >= 400) {
      const errorRes = response as ErrorResponse;
      setErrorMessage(RESET_PASSWORD_ERRORS[errorRes.error] || DEFAULT_ERROR);
    } else {
      setSuccessMessage('');
      toast(PASSWORD_RESET_SUCCESS.reset);
      handleClose();
    }
  };

  if (showingForm === RESET_PASSWORD_FORM)
    return (
      <ResetPasswordForm
        onSubmit={handleSendResetEmail}
        loading={isLoading}
        error={errorMessage}
        success={successMessage}
        email={email}
        setEmail={setEmail}
        emailError={emailError}
        setEmailError={setEmailError}
      />
    );
  if (showingForm === ENTER_RESET_CODE_FORM)
    return (
      <EnterResetCodeForm
        onSubmit={handleSubmitResetCode}
        loading={isLoading}
        error={errorMessage}
        email={email}
        resendEmail={handleSendResetEmail}
        success={successMessage}
        codeError={codeError}
        setCodeError={setCodeError}
      />
    );

  if (showingForm === ENTER_NEW_PASSWORD_FORM)
    return (
      <EnterNewPasswordForm
        onSubmit={handleNewPassword}
        loading={isLoading}
        error={errorMessage}
        success={successMessage}
        passwordError={passwordError}
        setPasswordError={setPasswordError}
        confirmPasswordError={confirmPasswordError}
        setConfirmPasswordError={setConfirmPasswordError}
      />
    );

  return null;
};

export default ResetPasswordModalContent;
