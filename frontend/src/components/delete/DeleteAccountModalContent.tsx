import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LANDING_PAGE_ROUTE } from 'Routes';
import { useTheme } from 'styled-components';

import Button from 'components/input/Button';
import { BACKEND_ENDPOINT, USER_ACCOUNT_ENDPOINT } from 'constants/Api';
import { DEFAULT_ERROR, DELETE_ACCOUNT_SUCCESS } from 'constants/Messages';
import { makeAuthenticatedDELETERequest } from 'utils/Api';
import { logOut } from 'utils/Auth';

import {
  ButtonsWrapper,
  ConfirmationText,
  DeleteAccountTitle,
  DeleteModalWrapper,
} from './styles/DeleteAccount';

export type DeleteAccountModalContentProps = {
  onRequestClose?: () => void;
};

const DeleteAccountModalContent = ({
  onRequestClose = () => {},
}: DeleteAccountModalContentProps) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const history = useHistory();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const [, status] = await makeAuthenticatedDELETERequest(
        `${BACKEND_ENDPOINT}${USER_ACCOUNT_ENDPOINT}`,
        {},
      );
      if (status < 400) {
        toast(DELETE_ACCOUNT_SUCCESS);
        logOut(dispatch);
        history.push(LANDING_PAGE_ROUTE);
        onRequestClose();
      } else {
        throw new Error();
      }
    } catch (err) {
      toast(DEFAULT_ERROR);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DeleteModalWrapper>
      <DeleteAccountTitle>Delete your account</DeleteAccountTitle>
      <ConfirmationText>
        Your reviews will be anonymized and the rest of your account data will
        be permanently deleted.
      </ConfirmationText>
      <ConfirmationText>
        Are you sure you want to continue? This action cannot be undone.
      </ConfirmationText>
      <ButtonsWrapper>
        <Button
          color={theme.dark3}
          handleClick={onRequestClose}
          margin="0 16px 0 0"
        >
          Cancel
        </Button>
        <Button color={theme.red} handleClick={handleDelete} loading={deleting}>
          Delete
        </Button>
      </ButtonsWrapper>
    </DeleteModalWrapper>
  );
};

export default DeleteAccountModalContent;
