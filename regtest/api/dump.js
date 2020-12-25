import http from "k6/http";
import { check, group } from "k6";
import { API_URL } from "/src/const.js";
import { keysAre, withLog } from "/src/util.js";

const ENDPOINT = API_URL + "/data/search";

function getDump() {
  return http.get(ENDPOINT);
}

export default function(data) {
  group("dump", function() {
    check(getDump(), withLog({
      "status": (r) => r.status == 200,
      "keys": (r) => keysAre(r.json(), ["courses", "profs"]),
      "course count": (r) => r.json("courses").length > 7000,
      "course keys": (r) => keysAre(
        r.json("courses.0"),
        ["id", "code", "name", "profs", "rating_count"]
      ),
      "prof count": (r) => r.json("courses").length > 5000,
      "profs keys": (r) => keysAre(
        r.json("profs.0"),
        ["id", "code", "name", "courses", "rating_count"]
      ),
    }));
  });
}
