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
    if (!__ENV.FB_APP_ID || !__ENV.FB_APP_SECRET) {
      console.log("[*] skipping facebook login: FB_APP_ID and FB_APP_SECRET are not set");
      return;
    }

    const token = getAccessToken(__VU);
    const first = login(token);
    group("valid token", function() {
      check(first, withLog({
        "status": (r) => r.status == 200,
        "keys": (r) => keysAre(r.json(), ["token", "user_id", "is_new"]),
        "marks new user": (r) => r.json("is_new") === true,
      }));
    });
    const second = login(token);
    group("repeated login", function() {
      check(second, withLog({
        "status": (r) => r.status == 200,
        "matches first login": (r) => r.json("user_id") == first.json("user_id"),
        "marks existing user": (r) => r.json("is_new") === false,
      }));
    });
  });
}
