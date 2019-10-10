# UW API importer

This program fetches data from the UW API and records them in the database.

## How to run this

Ensure that Docker-compose is up and run

```sh
go build
export $(cat ../.env | xargs)
./mongo-exporter
```

You will need at least `go v1.13`.

## How to obtain a `UW_API_KEY_V2`?

It is [claimed](https://uwaterloo.ca/api/register-api-key) that it cannot be done:

> Registration of API keys is currently disabled [...]

The claim is false due to what is likely an oversight.
Get your key through [this page](https://uwaterloo.ca/api/register).

## How to obtain a `UW_API_KEY_V3`?

The official instructions require a proprietary VPN. They are therefore duplicated here.

First, run the following, substituting your information as needed:

```
$ curl \
  --request POST \
  --url https://openapi.data.uwaterloo.ca/v3/account/register \
  --header 'content-type: application/x-www-form-urlencoded' \
  --data 'email=YOUR_EMAIL&project=uwflow-YOUR_NAME-test&uri=https%3A%2F%2Fuwflow.com'
```

If this succeeds, your email will be echoed.
You will receive an activation email with a confirmation code.
**Do not** run the command in that email, because it is broken.
Run the following instead:
```
$ curl \
  --request POST \
  --url https://openapi.data.uwaterloo.ca/v3/account/confirm \
  --header 'content-type: multipart/form-data' \
  --form email=YOUR_EMAIL \
  --form code=YOUR_CODE
```
Note the lack of the `boundary` header.

You should hereupon be told that your account has been activated.
You should now save the API key from the activation email in a secure place.
In addition, add it under `UW_API_KEY_V3` in `.env`.
