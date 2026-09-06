import React, { ReactNode, SyntheticEvent, useState } from 'react';
import { toast } from 'react-toastify';
import { useMutation } from '@apollo/client';
import { useTheme } from 'styled-components';

import Button from 'components/input/Button';
import Textbox from 'components/input/Textbox';
import { EMAIL_ERROR, EMAIL_UPDATE_SUCCESS } from 'constants/Messages';
import { UPDATE_USER_EMAIL } from 'graphql/mutations/Email';
import { validateEmail } from 'utils/Email';

import {
  ButtonsWrapper,
  EmailInputFormWrapper,
  FormTitle,
  TextboxWrapper,
} from './styles/EmailInputForm';

type EmailInputFormProps = {
  onClose: () => void;
  renderText: () => ReactNode;
  submitText: string;
  title: string;
  email?: string;
  onSuccess?: (email?: string) => void;
};

const EmailInputForm = ({
  email,
  title,
  renderText,
  submitText,
  onClose,
  onSuccess = () => {},
}: EmailInputFormProps) => {
  const theme = useTheme();

  const userId = localStorage.getItem('user_id');
  const [emailText, setEmailText] = useState(email || '');
  const [emailError, setEmailError] = useState(false);
  const [updateEmail] = useMutation(UPDATE_USER_EMAIL);

  const notifyUpdate = () => toast(EMAIL_UPDATE_SUCCESS);
  const notifyError = () => toast(EMAIL_ERROR);

  const onSubmit = (event: SyntheticEvent<EventTarget>) => {
    event.preventDefault();
    if (!validateEmail(emailText)) {
      setEmailError(true);
    } else {
      updateEmail({ variables: { user_id: userId, email: emailText } })
        .then(() => {
          notifyUpdate();
          onSuccess(email);
          onClose();
        })
        .catch(() => notifyError());
    }
  };

  return (
    <EmailInputFormWrapper onSubmit={onSubmit}>
      <FormTitle>{title}</FormTitle>
      {renderText()}
      <TextboxWrapper>
        <Textbox
          text={emailText}
          setText={(value) => {
            setEmailText(value);
            setEmailError(false);
          }}
          placeholder="Email"
          maxLength={100}
          error={emailError}
          options={{ width: '100%', type: 'email' }}
        />
      </TextboxWrapper>
      <ButtonsWrapper>
        <Button color={theme.dark3} handleClick={onClose} margin="0 16px 0 0">
          Cancel
        </Button>
        <Button handleClick={onSubmit} type="submit">
          {submitText}
        </Button>
      </ButtonsWrapper>
    </EmailInputFormWrapper>
  );
};

export default EmailInputForm;
