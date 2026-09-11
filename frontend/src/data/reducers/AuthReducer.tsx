import {
  AuthAction,
  AuthState,
  LOGGED_IN,
  LOGGED_OUT,
} from 'data/actions/AuthActions';
import { isLoggedIn } from 'utils/Auth';

const DEFAULT_STATE: AuthState = {
  loggedIn: isLoggedIn(),
};

export default (state = DEFAULT_STATE, action: AuthAction) => {
  switch (action.type) {
    case LOGGED_IN:
      return {
        ...state,
        loggedIn: true,
      };
    case LOGGED_OUT:
      return {
        ...state,
        loggedIn: false,
      };
    default:
      break;
  }
  return state;
};
