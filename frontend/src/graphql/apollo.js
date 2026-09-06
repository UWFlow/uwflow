import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

import { GRAPHQL_ENDPOINT } from 'constants/Api';
import { logOut } from 'utils/Auth';

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');

  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path }) => {
      console.log(
        `[GQL Error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      );
      // hard coded error message for now
      if (message.includes('JWT')) {
        logOut(() => {});
        document.location.reload();
      }
      return null;
    });
  }
  if (networkError) {
    console.log(networkError);
  }
});

const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
});

const link = ApolloLink.from([
  authLink,
  errorLink,
  httpLink, // terminating link must be added last
]);

// UWFlow exposes a number of Hasura views / composite-key relationships whose
// primary key isn't a plain `id`/`_id` field. Declare per-type `keyFields` so
// Apollo's cache normalizes them correctly; every other type falls back to the
// default `id`/`_id` heuristic.
export const cache = new InMemoryCache({
  typePolicies: {
    course_search_index: {
      keyFields: ['course_id'],
    },
    prof_search_index: {
      keyFields: ['prof_id'],
    },
    queue_section_subscribed: {
      keyFields: ['section_id', 'user_id'],
    },
    user_shortlist: {
      keyFields: ['course_id', 'user_id'],
    },
    user_course_taken: {
      keyFields: ['term_id', 'course_id'],
    },
    user_schedule: {
      // `user_id` plus the nested `section.id`. The trailing `['id']` declares
      // the subfields of the preceding `section` object field — this is not the
      // same as `['user_id', ['section', 'id']]`, which would (wrongly) treat
      // `section`/`id` as subfields of the scalar `user_id`.
      keyFields: ['user_id', 'section', ['id']],
    },
    user_schedule_swap: {
      keyFields: ['user_id', 'source_section_id'],
    },
  },
});

const client = new ApolloClient({
  link,
  cache,
  // Apollo Client v3 gates the DevTools connection on `globalThis.__DEV__`,
  // which our Webpack build never defines — so without this it defaults to
  // enabled and attaches DevTools in production/staging. Tie it to NODE_ENV
  // instead (DefinePlugin statically replaces this), disabling it in prod.
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
});

export default client;
