import React from 'react';

import { FormText } from './styles/EmailInputForm';
import EmailInputForm from './EmailInputForm';

const renderText = () => (
  <FormText>
    We will send an alert to the following email when a spot opens up in a
    course section you&apos;ve subscribed to.
  </FormText>
);

export type EditEmailModalContentProps = {
  email?: string;
  onRequestClose?: () => void;
};

const EditEmailModalContent = ({
  email,
  onRequestClose = () => {},
}: EditEmailModalContentProps) => (
  <EmailInputForm
    email={email}
    title="Edit your email"
    renderText={renderText}
    submitText="Save"
    onClose={onRequestClose}
  />
);

export default EditEmailModalContent;
