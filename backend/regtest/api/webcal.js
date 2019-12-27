import http from "k6/http";
import { check, group } from "k6";
import { API_URL } from "/src/const.js";
import { withLog } from "/src/util.js";

import { getUser } from "/src/graphql/user.js";

const ENDPOINT = API_URL + "/calendar";
const EXPECTED = open("/src/fixtures/calendar.txt");

export function getCalendar(secret_id) {
  return http.get(ENDPOINT + `/${secret_id}.ics`);
}

export default function(data) {
  group("calendar", function() {
    const user = getUser(data.email.user_id, data.email.token);
    group("valid", function() {
      check(getCalendar(user.json('data.user.0.secret_id')), withLog({
        "status": (r) => r.status == 201,
        "MIME type": (r) => r.headers["Content-Type"] == "text/calendar",
        // DTSTAMP entries reflect time of query, therefore have to be expunged
        "correct body": (r) => r.body.replace(/DTSTAMP.*\n/g, '') == EXPECTED,
      }));
    });
    group("invalid", function() {
      check(getCalendar("notanid"), withLog({
        "status": (r) => r.status == 401,
      }));
    });
  });
}
