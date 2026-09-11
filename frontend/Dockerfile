# syntax=docker/dockerfile:1.4
FROM oven/bun:1.3.14-alpine AS builder
WORKDIR /work
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run lint-nofix

# PostHog project key is a publishable client key (inlined into the bundle by
# DefinePlugin), not a secret — pass it as a plain build-arg. Discarded with
# this stage; never reaches the final nginx image.
ARG REACT_APP_POSTHOG_KEY
ENV REACT_APP_POSTHOG_KEY=$REACT_APP_POSTHOG_KEY

# Sentry auth token is optional: when provided (as a build secret), build and
# upload sourcemaps; otherwise just build the app and skip the Sentry upload.
RUN --mount=type=secret,id=sentry_auth_token,required=false \
    if [ -s /run/secrets/sentry_auth_token ]; then \
        export SENTRY_AUTH_TOKEN="$(cat /run/secrets/sentry_auth_token)" && \
        bun run build; \
    else \
        echo "No sentry_auth_token secret provided — building without Sentry sourcemap upload" && \
        bun scripts/build.js; \
    fi

FROM nginx:alpine

COPY --from=builder /work/build /build
