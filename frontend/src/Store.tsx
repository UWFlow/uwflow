import { debounce } from 'lodash';
import { applyMiddleware, createStore } from 'redux';
import { createLogger } from 'redux-logger';
/* Middleware */
import thunk from 'redux-thunk';

import { BrowserWindowResized } from './data/actions/BrowserActions';
import rootReducer from './data/reducers/RootReducer';

const loggerMiddleware = createLogger({
  predicate: () => process.env.NODE_ENV === 'development',
});

const middleware = [thunk, loggerMiddleware] as any[];

export const configureStore = () => {
  const store = createStore(rootReducer, applyMiddleware(...middleware));

  store.dispatch(BrowserWindowResized(window.innerWidth, window.innerHeight));

  // List on browser resize
  window.addEventListener(
    'resize',
    debounce(() => {
      store.dispatch(
        BrowserWindowResized(window.innerWidth, window.innerHeight),
      );
    }, 100),
  );

  return store;
};
