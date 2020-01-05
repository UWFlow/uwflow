import http from "k6/http";
import { check, group } from "k6";
import { API_URL } from "/src/const.js";
import { withLog } from "/src/util.js";

const ENDPOINT = API_URL + "/parse/schedule";
const VALID_SCHEDULE = open("/src/fixtures/schedule.txt");

function uploadSchedule(text, token) {
  const payload = {text}; 
  const headers = {"Authorization": `Bearer ${token}`};
  return http.post(ENDPOINT, JSON.stringify(payload), {headers});
}

export default function(data) { 
  group("schedule", function() {
    group("unauthorized", function() {
      check(uploadSchedule(VALID_SCHEDULE, ""), withLog({
        "status": (r) => r.status == 401,
      }));
    });
    group("valid", function() {
      check(uploadSchedule(VALID_SCHEDULE, data.email.token), withLog({
        "status": (r) => r.status == 200,
        "section count": (r) => r.json("sections_imported") == 9,
      }));
    });
    group("valid again", function() {
      check(uploadSchedule(VALID_SCHEDULE, data.email.token), withLog({
        "status": (r) => r.status == 200,
        "section count": (r) => r.json("sections_imported") == 9,
      }));
    });
    group("malformed", function() {
      check(uploadSchedule("", data.email.token), withLog({
        "status": (r) => r.status == 400,
      }));
    });
  });
}
