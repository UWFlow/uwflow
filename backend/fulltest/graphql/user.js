import { check, group } from "k6";
import { test } from "/src/util.js";
import { graphql, AFFECTED_ROWS, DATA } from "/src/graphql/common.js";

const DELETE_MUTATION = `
mutation mutate($user_id: Int!) {
  delete_user(where: {id: {_eq: $user_id}}) {
    affected_rows
  }
}`;

const GET_QUERY = `
query get($user_id: Int!) {
  user(where: {id: {_eq: $user_id}}) {
    id
    full_name
    picture_url
    program
    secret_id
  }
}`;

function testDeleteUser(data) {
  check(graphql(DELETE_MUTATION, {user_id: 42}, data.email.token), {
    "unrelated user not deleted": (r) => r.json(AFFECTED_ROWS) == 0,
  });
  check(graphql(DELETE_MUTATION, {user_id: data.email.user_id}, data.email.token), {
    "email user deleted": (r) => r.json(AFFECTED_ROWS) == 1,
  });
  check(graphql(DELETE_MUTATION, {user_id: data.email.user_id}, data.email.token), {
    "repeated deletion rejected": (r) => r.json(AFFECTED_ROWS) == 0,
  });
}

function testGetUser(data) {
  check(graphql(GET_QUERY, {user_id: 42}, data.email.token), {
    "unrelated user not fetched": (r) => r.json(DATA).length == 0,
  });
  check(getUser(GET_QUERY, {user_id: data.email.user_id}, data.email.token), {
    "email user fetched": (r) => r.json(DATA).length == 1,
  });
}

export default function(data) {
  group("get user", () => testGetUser(data));
  group("delete user", () => testDeleteUser(data));
}
