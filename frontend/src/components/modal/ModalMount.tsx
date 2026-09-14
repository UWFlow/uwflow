import React from 'react';

import { modalNameToModal } from 'components/modal/ModalUtils';

import Modal from './Modal';
import { ModalContext, ModalContextProps, ModalData } from './ModalProvider';

type ModalMountInnerProps = {
  modalsById: ModalData[];
};

const ModalMountInner = ({ modalsById }: ModalMountInnerProps) => (
  <>
    {modalsById.map((modalData) => (
      <Modal
        isOpen={modalData.isOpen}
        onRequestClose={modalData.props.onRequestClose}
        onAfterClose={modalData.props.onAfterClose}
        key={`${modalData.id}${modalData.modalName}`}
      >
        {modalNameToModal[modalData.modalName](modalData.props)}
      </Modal>
    ))}
  </>
);

const ModalMount = () => (
  <ModalContext.Consumer>
    {(context: ModalContextProps) => (
      <ModalMountInner modalsById={context[2]} />
    )}
  </ModalContext.Consumer>
);

export default ModalMount;
