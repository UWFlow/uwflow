import { Route } from 'react-router-dom';
import * as Sentry from '@sentry/react';

import { history } from './browserhistory';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: 'https://4fc1290ffbf3e98712374e16e8cea4ac@o4504154328465408.ingest.us.sentry.io/4508889530236928',
    integrations: [
      Sentry.reactRouterV5BrowserTracingIntegration({ history }),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracePropagationTargets: ['localhost'],
    // Session Replay
    replaysSessionSampleRate: 0.5, // This sets the sample rate at 50%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
  });
}

// Optionally export anything from here if needed
export const SentryRoute = Sentry.withSentryRouting(Route);
