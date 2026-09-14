import React, {
  createContext,
  ReactNode,
  useCallback,
  useRef,
  useState,
} from 'react';

import { ModalName } from 'constants/Modal';

export type ModalData = {
  id: string;
  isOpen: boolean;
  modalName: ModalName;
  props: any;
};

export type ModalContextProps = [
  (modal: ModalName, id: string, props: any) => void,
  (modal: ModalName, id: string) => void,
  ModalData[],
];

export const ModalContext = createContext<ModalContextProps>([
  () => {},
  () => {},
  [],
]);

const modalIndexById = (id: string, modal: ModalName, modals: ModalData[]) => {
  for (let i = modals.length - 1; i >= 0; i -= 1) {
    if (modals[i].id === id && modals[i].modalName === modal) {
      return i;
    }
  }
  return -1;
};

type ModalProviderProps = {
  children: ReactNode;
};

// Modals can be mounted but not open when going through closing animation
const ModalProvider = ({ children }: ModalProviderProps) => {
  const [modalsById, setModalsById] = useState<ModalData[]>([]);
  const currentModalsById = useRef<any>(null);
  currentModalsById.current = modalsById;

  const injectOnAfterCloseIntoProps = useCallback(
    (modal: ModalName, id: string, props: any) => {
      const originalOnAfterClose = props.onAfterClose;
      props.onAfterClose = () => {
        const newModalsById = [...currentModalsById.current];
        newModalsById.splice(modalIndexById(id, modal, newModalsById), 1);
        setModalsById(newModalsById);
        if (originalOnAfterClose) {
          originalOnAfterClose();
        }
      };
      return props;
    },
    [currentModalsById],
  );

  const closeModal = useCallback(
    (modal: ModalName, id: string) => {
      const newModalsById = [...currentModalsById.current];
      newModalsById[modalIndexById(id, modal, newModalsById)].isOpen = false;
      setModalsById(newModalsById);
    },
    [currentModalsById],
  );

  const openModal = useCallback(
    (modal: ModalName, id: string, props: any) => {
      const newModalsById = [...currentModalsById.current];
      newModalsById.push({
        id,
        modalName: modal,
        props: {
          onRequestClose: () => closeModal(modal, id),
          ...injectOnAfterCloseIntoProps(modal, id, props),
        },
        isOpen: true,
      });
      setModalsById(newModalsById);
    },
    [currentModalsById, injectOnAfterCloseIntoProps, closeModal],
  );

  return (
    <ModalContext.Provider value={[openModal, closeModal, modalsById]}>
      {children}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
