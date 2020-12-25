import http from "k6/http";
import { check, group } from "k6";
import { keysAre, withLog } from "/src/util.js";
import { API_URL } from "/src/const.js";

const ENDPOINT = API_URL + "/auth/email/register";

function register(first, last, email, password) {
  const payload = {first_name: first, last_name: last, email, password};
  return http.post(ENDPOINT, JSON.stringify(payload));
}

export default function(data) {
  group("email register", function() {
    group("empty fields", function() {
      [
        ["", "", "", ""], ["first", "", "", ""], ["", "last", "", ""],
        ["first", "last", "", ""], ["first", "last", "email", ""], 
        ["", "", "email", ""], ["", "", "", "pass"],
      ].forEach(cred => check(register(...cred), withLog({
        "status": (r) => r.status == 400,
        "error message": (r) => r.json("error") == "bad_request",
      })));
    });
    group("short fields", function() {
      const email = "test@test.test", password = "password", first = "First", last = "Last";
      check(register(first, last, email, "pass"), withLog({
        "status": (r) => r.status == 400,
        "error message": (r) => r.json("error") == "password_too_short",
      }));
      check(register(first, last, "@a.b", password), withLog({
        "status": (r) => r.status == 400,
        "error message": (r) => r.json("error") == "email_too_short",
      }));
    });

    const testUser = {
      first: `Test`,
      last:  `User ${__VU}`,
      email: `test+${__VU}@test.test`,
      password: `password${__VU}`,
    };
    const res = register(testUser.first, testUser.last, testUser.email, testUser.password);

    group("valid registration", function() {
      check(res, withLog({
        "status": (r) => r.status == 200,
        "fields": (r) => keysAre(r.json(), ["token", "user_id"]),
      }));
    });

    data.email = Object.assign(res.json(), testUser);

    group("duplicate registration", function() {
      const res = register(testUser.first, testUser.last, testUser.email, testUser.password);
      check(res, withLog({
        "status": (r) => r.status == 401,
        "error message": (r) => r.json("error") == "email_taken",
      }));
    });
  });
}
