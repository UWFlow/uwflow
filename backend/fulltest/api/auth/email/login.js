import http from "k6/http";
import { check, group } from "k6";
import { keysAre, withLog } from "/src/util.js";
import { API_URL } from "/src/const.js";

const ENDPOINT = API_URL + "/auth/email/login";

function login(email, password) {
  const payload = {email: email, password: password};
  return http.post(ENDPOINT, JSON.stringify(payload));
}

export default function(data) {
  group("email login", function() {
    group("nonexistent email", function() {
      check(login("not an email", "not a password"), withLog({
        "status": (r) => r.status == 401,
        "error message": (r) => r.json("error") == "email_not_registered",
      }));
    });
    group("incorrect password", function() {
      check(login(data.email.email, "not the password"), withLog({
        "status": (r) => r.status == 401,
        "error message": (r) => r.json("error") == "email_wrong_password",
      }));
    });
    group("correct credentials", function() {
      check(login(data.email.email, data.email.password), withLog({
        "status": (r) => r.status == 200,
        "keys": (r) => keysAre(r.json(), ["token", "user_id", "secret_id"]),
        "user_id matches registration": (r) => r.json("user_id") == data.email.user_id,
      }));
    });
  });
}
