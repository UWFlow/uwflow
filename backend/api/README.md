# API server

This is the Flow API server for handling non-CRUD tasks.

## Features

- Authentication:
  - [x] email
  - [ ] OpenID
- Parsing:
  - [ ] schedule
  - [x] transcript

## How to run this

Run the following line (or equivalent for your distribution) once.
This will install the required packages
(TODO: dockerize to remove the need for this).

```sh
apt install g++ libpoppler-cpp-dev
```

Ensure that Docker-compose is up and run

```sh
go build
export (cat ../.env | xargs)
./api
```

You will need at least `go v1.12`.
