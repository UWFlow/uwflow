import { check, group } from "k6";

export function keysAre(object, keys) {
  const union = new Set(Object.keys(object), keys);
  return union.size == keys.length;
}

export function logOnFailure(response, name, predicate) {
  var result, detail;
  var exception = null;
  try {
    result = predicate(response);
  } catch (e) {
    exception = e;
    result = false;
  }

  if (!result) {
    try {
      detail = JSON.stringify(response.json());
    } catch(_) {
      detail = response.body;
    }
    if (exception === null) {
      console.log(`[*] ${name}: ${detail}`);
    } else {
      console.log(`[!] ${name}: ${detail}: ${exception}`);
    }
  }

  return result;
}

export function withLog(tests) {
  for (const name in tests) {
    const predicate = tests[name];
    tests[name] = (r) => logOnFailure(r, name, predicate);
  }
  return tests;
}
