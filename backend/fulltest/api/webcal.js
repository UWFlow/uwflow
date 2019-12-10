import http from "k6/http";
import { check, group } from "k6";
import { API_URL } from "/src/const.js";
import { withLog } from "/src/util.js";

const ENDPOINT = API_URL + "/schedule/ical";

function getCalendar(secret_id) {
  return http.get(ENDPOINT + `/${secret_id}.ics`);
}

function testCalendar(data) {
  check(getCalendar(data.email.secret_id), withLog({
    "calendar served": (r) => r.status == 201,
    "correct MIME type": (r) => r.headers["Content-Type"] == "text/calendar",
  }));
  check(getCalendar("notanid"), withLog({
    "error on nonexistent secret id": (r) => r.status == 401,
  }));
}

export default function(data) {
  group("calendar", () => testCalendar(data));
}
