import { toast } from 'react-toastify';

import { AuthAction, LOGGED_OUT } from 'data/actions/AuthActions';

// returns if a user is logged in or not
export const isLoggedIn = (): boolean => {
  return (
    localStorage.getItem('token') !== null &&
    localStorage.getItem('user_id') !== null
  );
};

export const getUserId = (): number => {
  return Number(localStorage.getItem('user_id'));
};

export const logOut = (
  dispatch: (arg: AuthAction) => void,
  showToast = false,
): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user_id');
  dispatch({ type: LOGGED_OUT });
  if (showToast) {
    toast('Logged out successfully!', { position: 'top-right' });
  }
};
