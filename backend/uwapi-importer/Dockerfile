######## BUILD STAGE ########
# Release image is alpine, so use alpine in builder also for ABI compatibility
FROM golang:alpine as builder

WORKDIR /app

# Downloading modules requires git, but it is not pre-installed on alpine
RUN apk add --no-cache git
# Copy only the necessary files at this stage
COPY go.mod go.sum ./
# This uses locked-down versions from go.mod and go.sum
RUN go mod download

# It is only now that we copy everything else. Why?
# Because every code change will invalidate everything past this point.
# Thus we avoid wasting work (especially package installs, which are slow).
COPY . .
# Run tests and refuse to proceed if they fail
RUN go test -v ./test/*/
# Actually build the executable
RUN go build

######## RELEASE STAGE ########
FROM alpine:latest

WORKDIR /app

COPY crontab /etc/cron.d/crontab
COPY --from=builder /app/uwapi-importer .

RUN crontab /etc/cron.d/crontab

CMD ["crond", "-f"]
