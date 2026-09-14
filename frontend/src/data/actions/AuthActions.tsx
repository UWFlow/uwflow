/* Type definitions */
export const LOGGED_IN = 'LOGGED_IN';
export const LOGGED_OUT = 'LOGGED_OUT';

export interface AuthState {
  loggedIn: boolean;
}

interface LoggedInAction {
  type: typeof LOGGED_IN;
}

interface LoggedOutAction {
  type: typeof LOGGED_OUT;
}

export type AuthAction = LoggedInAction | LoggedOutAction;

/* Action definitions */
export const loggedIn = (): LoggedInAction => ({
  type: LOGGED_IN,
});

export const loggedOut = (): LoggedOutAction => ({
  type: LOGGED_OUT,
});
