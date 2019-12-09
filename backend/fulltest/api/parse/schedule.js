import http from "k6/http";
import { check, group } from "k6";
import { API_URL } from "/src/const.js";

const ENDPOINT = API_URL + "/parse/schedule";
const VALID_SCHEDULE = open("/src/fixtures/schedule.txt");

function uploadSchedule(text, token) {
  const payload = {text}; 
  const headers = {"Authorization": `Bearer ${token}`};
  return http.post(ENDPOINT, JSON.stringify(payload), {headers});
}

function testSchedule(data) { 
  check(uploadSchedule(VALID_SCHEDULE, ""), {
    "auth required": (r) => r.status == 401,
  });
  check(uploadSchedule(VALID_SCHEDULE, data.email.token), {
    "valid schedule accepted": (r) => r.status == 200,
    "all sections imported": (r) => r.json("sections_imported") == 13,
  });
  check(uploadSchedule("", data.email.token), {
    "invalid schedule rejected": (r) => r.status == 400,
  });
}

export default function(data) {
  group("schedule", () => testSchedule(data));
}
