import http from "k6/http";
import { check, group } from "k6";
import { keysAre, withLog } from "/src/util.js";
import { API_URL } from "/src/const.js";

const ENDPOINT = API_URL + "/auth/email/register";

function register(email, name, password) {
  const payload = {email, name, password};
  return http.post(ENDPOINT, JSON.stringify(payload));
}

function testRegister(data) {
  check(register(testUser.email, testUser.name, testUser.password), withLog({
    "existing email forbidden": (r) => r.status == 400,
  }));
}

export default function(data) {
  group("email register", function() {
    group("empty fields", function() {
      [
        ["", "", ""], ["email", "", ""], ["", "name", ""], ["email", "name", ""]
      ].forEach(cred => check(register(...cred), withLog({
        "status": (r) => r.status == 400,
        "error message": (r) => r.json("error") == "bad_request",
      })));
    });
    group("short fields", function() {
      const email = "test@test.test", password = "password", name = "First Last";
      check(register(email, name, "pass"), withLog({
        "status": (r) => r.status == 400,
        "error message": (r) => r.json("error") == "password_too_short",
      }));
      check(register("@a.b", name, password), withLog({
        "status": (r) => r.status == 400,
        "error message": (r) => r.json("error") == "email_too_short",
      }));
    });

    const testUser = {
      name: `Test User ${__VU}`,
      email: `test+${__VU}@test.test`,
      password: `password${__VU}`,
    };
    const res = register(testUser.email, testUser.name, testUser.password);

    group("valid registration", function() {
      check(res, withLog({
        "status": (r) => r.status == 200,
        "fields": (r) => keysAre(r.json(), ["token", "user_id", "secret_id"]),
      }));
    });

    data.email = Object.assign(res.json(), testUser);

    group("duplicate registration", function() {
      const res = register(testUser.email, testUser.name, testUser.password);
      check(res, withLog({
        "status": (r) => r.status == 401,
        "error message": (r) => r.json("error") == "email_taken_by_email",
      }));
    });
  });
}
