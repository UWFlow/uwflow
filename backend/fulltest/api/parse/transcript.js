import http from "k6/http";
import { check, group } from "k6";
import { API_URL } from "/src/const.js";

const ENDPOINT = API_URL + "/parse/transcript";
const VALID_TRANSCRIPT = open("/src/fixtures/transcript.pdf", "b");

function uploadTranscript(file, token) {
  const payload = {file: http.file(file, "file")};
  const headers = {"Authorization": `Bearer ${token}`};
  return http.post(ENDPOINT, payload, {headers});
}

function testTranscript(data) { 
  check(uploadTranscript(VALID_TRANSCRIPT, ""), {
    "auth required": (r) => r.status == 401,
  });
  check(uploadTranscript(VALID_TRANSCRIPT, data.email.token), {
    "valid transcript accepted": (r) => r.status == 200,
    "all courses imported": (r) => r.json("courses_imported") == 27,
  });
  check(uploadTranscript("not a transcript", data.email.token), {
    "invalid transcript rejected": (r) => r.status == 400,
  });
}

export default function(data) {
  group("transcript", () => testTranscript(data));
}
