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
    `https://graph.facebook.com/v5.0/${app_id}/accounts/test-users?${param}`,
  );
  console.log(`https://graph.facebook.com/v5.0/${app_id}/accounts/test-users?${param}`);
  return res.json("data")[number].access_token;
}

function testLogin(data) {
  const token = getAccessToken(__VU);
  check(login(token), withLog({
    "correct credentials accepted": (r) => r.status == 200,
    "has token and user_id": (r) => keysAre(r.json(), ["token", "user_id"]),
  }));
}

export default function(data) {
  group("facebook login", () => testLogin(data));
}
