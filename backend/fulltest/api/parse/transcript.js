import http from "k6/http";
import { check, group } from "k6";
import { API_URL } from "/src/const.js";
import { withLog } from "/src/util.js";

const ENDPOINT = API_URL + "/parse/transcript";
const VALID_TRANSCRIPT = open("/src/fixtures/transcript.pdf", "b");

function uploadTranscript(file, token) {
  const payload = {file: http.file(file, "file")};
  const headers = {"Authorization": `Bearer ${token}`};
  return http.post(ENDPOINT, payload, {headers});
}

export default function(data) { 
  group("transcript", function() {
    group("unauthorized", function() {
      check(uploadTranscript(VALID_TRANSCRIPT, ""), withLog({
        "status": (r) => r.status == 401,
      }));
    });
    group("valid", function() {
      check(uploadTranscript(VALID_TRANSCRIPT, data.email.token), withLog({
        "status": (r) => r.status == 200,
        "course count": (r) => r.json("courses_imported") == 27,
      }));
    });
    group("malformed", function() {
      check(uploadTranscript("not a transcript", data.email.token), withLog({
        "status": (r) => r.status == 400,
      }));
    });
  });
}
