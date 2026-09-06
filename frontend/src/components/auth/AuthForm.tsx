import React, {
  Dispatch,
  SetStateAction,
  SyntheticEvent,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { PRIVACY_PAGE_ROUTE } from 'Routes';

import { AUTH_ERRORS, AUTH_SUCCESS, DEFAULT_ERROR } from 'constants/Messages';
import { RESET_PASSWORD_MODAL } from 'constants/Modal';
import { LOGGED_IN } from 'data/actions/AuthActions';
import useModal from 'hooks/useModal';
import { capture, identify } from 'lib/analytics';
import { AuthResponse, ErrorResponse } from 'types/Api';
import { makePOSTRequest } from 'utils/Api';

import {
  ContentWrapper,
  GreyText,
  OrWrapper,
  PrivacyPolicyText,
  PrivacyWrapper,
  SwapModalLink,
  SwapModalWrapper,
  Wrapper,
} from './styles/AuthForm';
import { AuthFormState, HandleAuthFunction } from './AuthTypes';
import LoginContent from './LoginContent';
import SignupContent from './SignupContent';
import SocialLoginContent from './SocialLoginContent';

export type AuthMethod = 'email' | 'google' | 'facebook';

type AuthFormProps = {
  onLoginComplete: () => void;
  onSignupComplete: () => void;
  margin?: string;
  closeAuthModal?: () => void;
};

const AuthForm = ({
  onLoginComplete,
  onSignupComplete,
  margin = '32px 0',
  closeAuthModal,
}: AuthFormProps) => {
  const [openModal, closeModal] = useModal();
  const dispatch = useDispatch();

  const [showLoginForm, setShowLoginForm] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const setJWT = (response: AuthResponse) => {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user_id', response.user_id);
  };

  const onAuthSuccess = (response: AuthResponse, method: AuthMethod) => {
    setJWT(response);
    dispatch({ type: LOGGED_IN });
    if (response.is_new) {
      toast(AUTH_SUCCESS.signup);
      onSignupComplete();
    } else {
      toast(AUTH_SUCCESS.login);
      onLoginComplete();
    }
    // Analytics on the side — identify/capture defer themselves, so the login
    // toast and redirect above run first and are never blocked.
    identify(response.user_id);
    if (response.is_new) {
      capture('account_created', { method });
    }
  };

  const handleAuth: HandleAuthFunction = async <T extends object>(
    event: SyntheticEvent<EventTarget>,
    endpoint: string,
    data: T,
    setErrorMessage: Dispatch<SetStateAction<string>>,
    validateFields: () => boolean,
  ): Promise<void> => {
    event.preventDefault();

    if (!validateFields()) {
      return;
    }

    const [response, status] = await makePOSTRequest<
      T,
      AuthResponse | ErrorResponse
    >(endpoint, data);

    if (status >= 400) {
      const errorRes = response as ErrorResponse;
      setErrorMessage(AUTH_ERRORS[errorRes.error] || DEFAULT_ERROR);
    } else {
      onAuthSuccess(response as AuthResponse, 'email');
    }
  };

  const formState: AuthFormState = {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  };

  return (
    <>
      <Wrapper margin={margin}>
        <ContentWrapper>
          {showLoginForm ? (
            <LoginContent
              handleAuth={handleAuth}
              formState={formState}
              setEmail={setEmail}
              setPassword={setPassword}
              onShowResetPassword={() =>
                openModal(RESET_PASSWORD_MODAL, {
                  handleClose: () => closeModal(RESET_PASSWORD_MODAL),
                })
              }
            />
          ) : (
            <SignupContent
              handleAuth={handleAuth}
              formState={formState}
              setFirstName={setFirstName}
              setLastName={setLastName}
              setEmail={setEmail}
              setPassword={setPassword}
              setConfirmPassword={setConfirmPassword}
            />
          )}
          <OrWrapper>OR</OrWrapper>
          <SocialLoginContent onAuthSuccess={onAuthSuccess} />
          <PrivacyWrapper>
            <GreyText>Read our </GreyText>
            <PrivacyPolicyText to={PRIVACY_PAGE_ROUTE} onClick={closeAuthModal}>
              Privacy Policy
            </PrivacyPolicyText>
          </PrivacyWrapper>
        </ContentWrapper>
        <SwapModalWrapper>
          New to UW Flow?
          <SwapModalLink
            onClick={() => setShowLoginForm(!showLoginForm)}
            onMouseDown={(e) => e.preventDefault()}
          >
            {showLoginForm ? 'Sign up' : 'Log in'}
          </SwapModalLink>
        </SwapModalWrapper>
      </Wrapper>
    </>
  );
};

export default AuthForm;
