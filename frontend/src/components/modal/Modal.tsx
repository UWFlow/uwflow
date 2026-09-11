import React, { ReactNode } from 'react';
import { X } from 'react-feather';
import ReactModal from 'react-modal';

import { ModalChildren, ModalX } from './styles/Modal';

type ModalProps = {
  children: ReactNode;
  isOpen: boolean;
  onRequestClose: () => void;
  onAfterClose?: () => void;
};

/* Styles found in index.css */
const Modal = ({
  children,
  onRequestClose,
  isOpen,
  onAfterClose = () => {},
}: ModalProps) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick={true}
      closeTimeoutMS={150}
      className={'Modal'}
      overlayClassName={'ModalOverlay'}
      onAfterClose={onAfterClose}
    >
      <ModalChildren>
        <ModalX
          onClick={onRequestClose}
          onMouseDown={(e) => e.preventDefault()}
        >
          <X />
        </ModalX>
        {children}
      </ModalChildren>
    </ReactModal>
  );
};

export default Modal;
