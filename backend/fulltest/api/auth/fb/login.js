import http from "k6/http";
import { check, group } from "k6";
import { keysAre, withLog } from "/src/util.js";
import { API_URL } from "/src/const.js";

const ENDPOINT = API_URL + "/auth/facebook/login";

function login(access_token) {
  const payload = {access_token};
  return http.post(ENDPOINT, JSON.stringify(payload));
}

function getAccessToken(number) {
  const app_id = __ENV.FB_APP_ID;
  const secret = __ENV.FB_APP_SECRET;
  const param = `access_token=${app_id}|${secret}`;
  const res = http.get(
    `https://graph.facebook.com/${app_id}/accounts/test-users?${param}`,
  );
  return res.json("data")[number].access_token;
}

export default function(data) {
  group("facebook login", function() {
    const token = getAccessToken(__VU);
    const first = login(token);
    group("valid token", function() {
      check(first, withLog({
        "status": (r) => r.status == 200,
        "keys": (r) => keysAre(r.json(), ["token", "user_id", "secret_id"]),
      }));
    });
    const second = login(token);
    group("repeated login", function() {
      check(second, withLog({
        "status": (r) => r.status == 200,
        "matches first login": (r) => {
          return r.json("user_id") == first.json("user_id") &&
            r.json("secret_id") == r.json("secret_id")
        },
      }));
    });
  });
}
