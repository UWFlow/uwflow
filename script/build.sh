#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REVISION="$(git -C "$ROOT_DIR" rev-parse HEAD)"
IMAGE_TAG="${IMAGE_TAG:-$REVISION}"

if [[ ! "$IMAGE_TAG" =~ ^[a-zA-Z0-9_][a-zA-Z0-9_.-]{0,127}$ ]]; then
    echo "Invalid IMAGE_TAG: expected a Docker image tag" >&2
    exit 2
fi

if [[ $# -eq 0 ]]; then
    set -- api email uw frontend
fi
# Reject invalid input before starting any builds.
for target in "$@"; do
    case "$target" in
        api|email|uw|frontend) ;;
        *) echo "Unknown build target: $target (use api, email, uw, frontend)" >&2; exit 2 ;;
    esac
done

for target in "$@"; do
    args=(
        --tag "neuwflow/$target:$IMAGE_TAG"
        --tag "neuwflow/$target:latest"
        --label "org.opencontainers.image.revision=$REVISION"
        --label "org.opencontainers.image.source=https://github.com/UWFlow/uwflow"
    )
    if [[ "$target" == frontend ]]; then
        args+=(--build-arg "REACT_APP_POSTHOG_KEY=${REACT_APP_POSTHOG_KEY:-}")
        if [[ -n "${SENTRY_AUTH_TOKEN:-}" ]]; then
            args+=(--secret id=sentry_auth_token,env=SENTRY_AUTH_TOKEN)
        fi
        docker build "${args[@]}" "$ROOT_DIR/frontend"
    else
        docker build "${args[@]}" --target "$target" "$ROOT_DIR/flow"
    fi
done
