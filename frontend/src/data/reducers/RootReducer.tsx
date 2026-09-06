import { combineReducers } from 'redux';

import { BREAKPOINT_WIDTH } from 'constants/PageConstants';

import AuthReducer from './AuthReducer';
import BrowserReducer from './BrowserReducer';
import ModalReducer from './ModalReducer';

const rootReducer = combineReducers({
  browser: BrowserReducer,
  auth: AuthReducer,
  modal: ModalReducer,
});

/* Types */
export type RootState = ReturnType<typeof rootReducer>;

/* Selectors */
export const getIsBrowserDesktop = (state: RootState) =>
  state.browser.width >= BREAKPOINT_WIDTH;

export default rootReducer;
