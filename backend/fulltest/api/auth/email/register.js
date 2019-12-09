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
  [
    ["", "", ""], ["email", "", ""], ["", "name", ""], ["email", "name", ""],
  ].forEach(cred => check(register(...cred), withLog({
    "empty fields forbidden": (r) => r.status == 400,
  })));

  const testUser = {
    name: `Test User ${__VU}`,
    email: `test+${__VU}@test.test`,
    password: `test${__VU}`,
  };

  const res = register(testUser.email, testUser.name, testUser.password);
  check(res, withLog({
    "valid registration accepted": (r) => r.status == 200,
    "has token and user_id": (r) => keysAre(r.json(), ["token", "user_id"]),
  }));

  data.email = Object.assign(
    {token: res.json("token"), id: res.json("user_id")},
    testUser,
  );

  check(register(testUser.email, testUser.name, testUser.password), withLog({
    "existing email forbidden": (r) => r.status == 400,
  }));
}

export default function(data) {
  group("email register", () => testRegister(data));
}
