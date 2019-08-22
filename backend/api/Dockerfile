######## BUILD STAGE ########
# Release image is alpine, so use alpine in builder also for ABI compatibility
FROM golang:alpine as builder

WORKDIR /app
COPY . .

# Downloading modules requires git, but it is not pre-installed on alpine
RUN apk add --no-cache git
# This uses locked-down versions from go.mod and go.sum
RUN go mod download

# Transcript parsing pulls in these build dependencies
RUN apk add --no-cache g++ poppler-dev
RUN go build

######## RELEASE STAGE ########
FROM alpine:latest

WORKDIR /app

# Transcript parsing pulls in these runtime dependencies
RUN apk add --no-cache poppler

COPY --from=builder /app/api .

CMD ["./api"]
