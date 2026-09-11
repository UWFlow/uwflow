import {
  BROWSER_WINDOW_RESIZED,
  BrowserWindowAction,
  BrowserWindowState,
} from 'data/actions/BrowserActions';

const DEFAULT_STATE: BrowserWindowState = {
  width: 0,
  height: 0,
};

export default (state = DEFAULT_STATE, action: BrowserWindowAction) => {
  switch (action.type) {
    case BROWSER_WINDOW_RESIZED:
      return {
        ...state,
        ...action.payload,
      };
    default:
      break;
  }
  return state;
};
