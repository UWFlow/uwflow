import emailRegister from "/src/api/auth/email/register.js";
import emailLogin from "/src/api/auth/email/login.js";
import facebookLogin from "/src/api/auth/fb/login.js";
import dump from "/src/api/dump.js";
import transcript from "/src/api/parse/transcript.js";
import schedule from "/src/api/parse/schedule.js";
import calendar from "/src/api/webcal.js";

import graphqlUser from "/src/graphql/user.js";

export function setup() {
  return {};
}

export default function(data) {
  [
    // API tests
    emailRegister, emailLogin, facebookLogin,
    dump, transcript, schedule, calendar,
    // GraphQL tests
    graphqlUser,
  ].forEach(fn => fn(data));
}
