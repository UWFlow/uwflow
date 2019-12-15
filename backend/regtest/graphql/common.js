import http from "k6/http";
import { GRAPHQL_URL } from "/src/const.js";

export function graphql(mutation, variables, token) {
  const payload = {query: mutation, variables};
  const headers = {"Authorization": `Bearer ${token}`};
  return http.post(GRAPHQL_URL, JSON.stringify(payload), {headers});
}
