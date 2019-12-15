import { check, group } from "k6";
import { graphql, AFFECTED_ROWS } from "/src/graphql/common.js";
import { withLog } from "/src/util.js";

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
    first_name
    last_name
    full_name
    email
    picture_url
    program
    secret_id
  }
}`;

function testDeleteUser(data) {
  group("delete", function() {
    group("unauthorized", function() {
      check(graphql(DELETE_MUTATION, {user_id: 42}, data.email.token), withLog({
        "count": (r) => r.json("data.delete_user.affected_rows") == 0,
      }));
    });
    group("valid", function() {
      check(graphql(DELETE_MUTATION, {user_id: data.email.user_id}, data.email.token), withLog({
        "count": (r) => r.json("data.delete_user.affected_rows") == 1,
      }));
    });
    group("nonexistent", function() {
      check(graphql(DELETE_MUTATION, {user_id: data.email.user_id}, data.email.token), withLog({
        "count": (r) => r.json("data.delete_user.affected_rows") == 0,
      }));
    });
  });
}

function testGetUser(data) {
  group("get", function () {
    group("user", function() {
      check(graphql(GET_QUERY, {user_id: 42}, data.email.token), withLog({
        "count": (r) => r.json("data.user").length == 0,
      }));
    });
    group("valid", function() {
      check(graphql(GET_QUERY, {user_id: data.email.user_id}, data.email.token), withLog({
        "count": (r) => r.json("data.user").length == 1,
        "name matches": (r) => r.json("data.user.0.full_name") == data.email.first + " " + data.email.last,
      }));
    });
  });
}

export default function(data) {
  group("user", function() {
    testGetUser(data);
    testDeleteUser(data);
  });
}
