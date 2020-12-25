#!/bin/sh

# Bail on erros and uninitialized variables
set -eu

# Helpful functions
fail() {
  echo "[✗] $@" >&2
  exit 1
}

pass() {
  echo "[✔] $@"
}

warn() {
  echo "[❗] $@" >&2
}

# Helpful varaibles
export DIR="$(dirname $(realpath $0))"
export BACKEND_DIR="$(dirname $DIR)"

# Prefix docker commands with sudo if it appears necessary
if docker info >/dev/null 2>/dev/null
then
  export PREFIX=""
else
  if sudo docker info >/dev/null 2>/dev/null
  then
    export PREFIX="sudo"
  else
    fail "Cannot run docker info: is Docker installed?"
  fi
fi
