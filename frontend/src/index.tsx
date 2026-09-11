import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import App from 'App';
import { history } from 'browserhistory';
import { configureStore } from 'Store';
import { ThemeProvider } from 'styled-components';
// eslint-disable-next-line import/no-webpack-loader-syntax
import SearchWorker from 'worker-loader!search/search.worker';

import ModalProvider from 'components/modal/ModalProvider';
import Theme from 'constants/GlobalTheme';
import client from 'graphql/apollo.js';
import SearchProvider from 'search/SearchProvider';

import './sentry';

import './index.css';

const StartApp = () => {
  const store = configureStore();
  const container = document.getElementById('root');

  if (!container) {
    throw new Error('Could not find root element');
  }

  createRoot(container).render(
    <ApolloProvider client={client}>
      <ModalProvider>
        <SearchProvider searchWorker={new SearchWorker()}>
          <Provider store={store}>
            <Router history={history}>
              <ThemeProvider theme={Theme}>
                <App />
              </ThemeProvider>
            </Router>
          </Provider>
        </SearchProvider>
      </ModalProvider>
    </ApolloProvider>,
  );
};

StartApp();
