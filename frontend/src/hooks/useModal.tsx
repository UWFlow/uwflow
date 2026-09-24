import { useCallback, useContext, useState } from 'react';

import { ModalContext } from 'components/modal/ModalProvider';
import { ModalName } from 'constants/Modal';
import { randString } from 'utils/Random';

/* Hook for opening and closing modals */
const useModal = (): [
  (modal: ModalName, props?: any) => void,
  (modal: ModalName) => void,
] => {
  const [id] = useState(randString());
  const [openModal, closeModal] = useContext(ModalContext);

  const open = useCallback(
    (modal: ModalName, props: any = {}) => openModal(modal, id, props),
    [id, openModal],
  );
  const close = useCallback(
    (modal: ModalName) => closeModal(modal, id),
    [id, closeModal],
  );
  return [open, close];
};

export default useModal;
