# API server

This is the Flow API server for handling non-CRUD tasks.

## Features

- Authentication:
  - [x] email
  - [ ] OpenID

## How to run this

Ensure that Docker-compose is up and run

```sh
go build
export (cat ../.env | xargs)
./api
```

You will need at least `go v1.12`.
