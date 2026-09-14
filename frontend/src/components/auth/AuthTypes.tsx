import { Dispatch, SetStateAction, SyntheticEvent } from 'react';

export type HandleAuthFunction = <T extends object>(
  event: SyntheticEvent<EventTarget>,
  endpoint: string,
  data: T,
  setErrorMessage: Dispatch<SetStateAction<string>>,
  validateFields: () => boolean,
) => Promise<void>;

export type AuthFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};
