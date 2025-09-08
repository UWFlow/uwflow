######## BUILD STAGE ########
# Release image is alpine, so use alpine in builder also for ABI compatibility
FROM golang:1.19-alpine as builder

WORKDIR /build

# Downloading modules requires git, but it is not pre-installed on alpine
RUN apk add --no-cache git
# Copy only the necessary files at this stage
COPY go.mod go.sum ./
# This uses locked-down versions from go.mod and go.sum
RUN go mod download

# api/parse pulls in these build dependencies
RUN apk add --no-cache g++ poppler-dev
# It is only now that we copy everything else. Why?
# Because every code change will invalidate everything past this point.
# Thus we avoid wasting work (especially package installs, which are slow).
COPY . .
RUN go test ./...
RUN cd api && go build
RUN cd importer/uw && go build
RUN cd email && go build

######## RELEASE STAGE: API ########
FROM alpine:latest AS api

# parsing and webcal pull in these runtime dependencies
RUN apk add --no-cache poppler && \
    ln -s /usr/lib/libpoppler-cpp.so.2 /usr/lib/libpoppler-cpp.so.0

COPY --from=builder /build/api/api /app/api

CMD ["/app/api"]

######## RELEASE STAGE: UW IMPORTER ########
FROM alpine:latest AS uw

COPY --from=builder /build/importer/uw/uw /app/uw
COPY --from=builder /build/importer/uw/crontab /etc/cron.d/crontab
RUN crontab /etc/cron.d/crontab

CMD ["crond", "-f"]


######## RELEASE STAGE: EMAIL SERVER ########
FROM alpine:latest AS email

# email sending pulls in these runtime dependencies
RUN apk add --no-cache ca-certificates

COPY --from=builder /build/email/email /app/email

CMD ["/app/email"]
