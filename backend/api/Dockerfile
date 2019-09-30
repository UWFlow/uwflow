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

# Transcript parsing pulls in these build dependencies
RUN apk add --no-cache g++ poppler-dev
# It is only now that we copy everything else. Why?
# Because every code change will invalidate everything past this point.
# Thus we avoid wasting work (especially package installs, which are slow).
COPY . .
# TODO: We should run `go test` here and refuse to build if tests fail.
# Alas, we have no tests!
RUN go build

######## RELEASE STAGE ########
FROM alpine:latest

WORKDIR /app

# Transcript parsing pulls in these runtime dependencies
RUN apk add --no-cache poppler ca-certificates

COPY --from=builder /app/api .

CMD ["./api"]
