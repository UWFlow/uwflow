/* Global IDs */
export const GOOGLE_ANALYTICS_ID = 'UA-35073503-1';
export const GOOGLE_APP_ID = '292230821846-cogmasv1s0rbvhp0dr886vik2c73etb3';
export const FACEBOOK_APP_ID = '219309734863464';

/* Base endpoints */
const LOCAL_GRAPHQL_ENDPOINT = 'http://localhost:8080/v1/graphql';
const LOCAL_BACKEND_ENDPOINT = 'http://localhost:8081';

// Set /prod or /staging per Vercel preview branch. Explicit endpoint overrides
// below take precedence; leave them unset when selecting a backend path.
// Remove a trailing slash so /staging/ becomes /staging/api, not /staging//api.
const CONFIGURED_BACKEND_PATH = (
  process.env.REACT_APP_BACKEND_PATH || ''
).replace(/\/$/, '');

export const GRAPHQL_ENDPOINT =
  process.env.REACT_APP_GRAPHQL_ENDPOINT ||
  (process.env.NODE_ENV === 'development'
    ? LOCAL_GRAPHQL_ENDPOINT
    : `${CONFIGURED_BACKEND_PATH}/graphql`);

export const BACKEND_ENDPOINT =
  process.env.REACT_APP_BACKEND_ENDPOINT ||
  (process.env.NODE_ENV === 'development'
    ? LOCAL_BACKEND_ENDPOINT
    : `${CONFIGURED_BACKEND_PATH}/api`);

/* Auth */
export const EMAIL_AUTH_LOGIN_ENDPOINT = '/auth/email/login';
export const EMAIL_AUTH_REGISTER_ENDPOINT = '/auth/email/register';
export const GOOGLE_AUTH_ENDPOINT = '/auth/google/login';
export const FACEBOOK_AUTH_ENDPOINT = '/auth/facebook/login';
export const AUTH_REFRESH_ENDPOINT = '/auth/refresh';

/* Reset password */
export const RESET_PASSWORD_KEY_EMAIL_ENDPOINT =
  '/auth/forgot-password/send-email';
export const RESET_PASSWORD_VERIFY_KEY_ENDPOINT =
  '/auth/forgot-password/verify';
export const RESET_PASSWORD_RESET_PASSWORD_ENDPOINT =
  '/auth/forgot-password/reset';

/* Data upload */
export const SCHEDULE_PARSE_ENDPOINT = '/parse/schedule';
export const TRANSCRIPT_PARSE_ENDPOINT = '/parse/transcript';

/* Search */
export const SEARCH_DATA_ENDPOINT = '/data/search';

/* Calendar */
export const CALENDAR_EXPORT_ENDPOINT = (secretId: string) =>
  `/calendar/${secretId}.ics`;
export const GOOGLE_CALENDAR_URL = `https://calendar.google.com/calendar/r?cid=`;

/* User */
export const USER_ACCOUNT_ENDPOINT = '/user';
