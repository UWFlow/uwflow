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
# Basic sanity check to confirm that the directory is at least called "backend"
if test "$(basename $BACKEND_DIR)" != backend
then
  fail "$(basename $0) must be located in backend/script"
fi
