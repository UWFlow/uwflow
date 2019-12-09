import http from "k6/http";
import { check, group } from "k6";
import { keysAre, withLog } from "/src/util.js";
import { API_URL } from "/src/const.js";

const ENDPOINT = API_URL + "/auth/email/login";

function login(email, password) {
  const payload = {email: email, password: password};
  return http.post(ENDPOINT, JSON.stringify(payload));
}

function testLogin(data) { 
  check(login("not an email", "not a password"), withLog({
    "nonexistent email rejected": (r) => r.status == 401,
  }));
  check(login(data.email.email, "not the password"), withLog({
    "incorrect password rejected": (r) => r.status == 401,
  }));
  check(login(data.email.email, data.email.password), withLog({
    "correct credentials accepted": (r) => r.status == 200,
    "has token and user_id": (r) => keysAre(r.json(), ["token", "user_id"]),
    "user_id matches": (r) => r.json("user_id") == data.email.id,
  }));
}

export default function(data) {
  group("email login", () => testLogin(data));
}
