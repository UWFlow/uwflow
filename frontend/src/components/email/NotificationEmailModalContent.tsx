import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { History } from 'history';
import { Dispatch } from 'redux';
import { PROFILE_PAGE_ROUTE } from 'Routes';

import { notificationEmailModalClose } from 'data/actions/ModalActions';

import { FormLink, FormText } from './styles/EmailInputForm';
import EmailInputForm from './EmailInputForm';

const renderText = (history: History, dispatch: Dispatch) => () =>
  (
    <FormText>
      You can change this email anytime in your{' '}
      <FormLink
        onClick={() => {
          dispatch(notificationEmailModalClose());
          history.push(PROFILE_PAGE_ROUTE);
        }}
      >
        profile page
      </FormLink>
    </FormText>
  );

export type NotificationEmailModalContentProps = {
  onRequestClose: () => void;
  onSuccess: (email?: string) => void;
};

const NotificationEmailModalContent = ({
  onRequestClose,
  onSuccess,
}: NotificationEmailModalContentProps) => {
  const history = useHistory();
  const dispatch = useDispatch();

  return (
    <EmailInputForm
      title="Subscribe to alerts"
      renderText={renderText(history, dispatch)}
      submitText="Subscribe"
      onClose={onRequestClose}
      onSuccess={onSuccess}
    />
  );
};

export default NotificationEmailModalContent;
