# Slack data bot

Answers questions about UWFlow's data in Slack. Mention `@uwflow-data` in a
channel or DM it; it reads the thread, asks Claude (`claude-opus-5-5`), and lets
Claude list tables, describe them, and run read-only SQL against Postgres.

Socket Mode means the bot opens an outbound connection to Slack, so it needs
no public URL or nginx route.

## Safety

- It connects as `uwflow_slackbot` (see `role.sql`), which can read course,
  professor, review, and schedule data but not `secret`, `queue`, or `work`,
  user names or emails, or the per-review author views. It refuses to start as a
  superuser.
- Every query runs in a read-only transaction with a 15 second statement
  timeout, one statement per call, and at most 200 rows returned.
- Anyone in the Slack workspace can ask it anything those grants allow.

## Secrets

All credentials live in one Secrets Manager secret, `uwflow/slackbot` in
`us-east-2`, as a JSON object. The secret, the IAM policy that reads it, and the
`set-secret.sh` helper are in the `slackbot/` module of
[UWFlow/devops](https://github.com/UWFlow/devops); see its README for applying
it and setting values.

| Key | Value |
| --- | --- |
| `SLACK_BOT_TOKEN` | Bot token (`xoxb-…`) from **OAuth & Permissions** |
| `SLACK_APP_TOKEN` | App-level token (`xapp-…`) with `connections:write` |
| `ANTHROPIC_API_KEY` | Claude API key |
| `SLACKBOT_POSTGRES_USER` | `uwflow_slackbot` |
| `SLACKBOT_POSTGRES_PASSWORD` | Generated; also passed to `role.sql` |

At startup the bot reads the secret named by `SLACKBOT_SECRET_ID` with the
default AWS credential chain: an EC2 instance role, or the `uwflow-slackbot`
IAM user's keys in `.env` as `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.
Host, port, and database name come from `.env`. Without `SLACKBOT_SECRET_ID`,
every key is read from the environment instead, which is convenient locally.

## Setup

Steps 3–5 store values with `set-secret.sh` from the devops module.

1. Apply the `slackbot/` module in UWFlow/devops and give the prod host its
   credentials, as its README describes.
2. Create the Slack app from `manifest.yaml` at https://api.slack.com/apps
   (**Create New App → From a manifest**, UWFlow workspace).
3. Under **Basic Information → App-Level Tokens**, create a token with the
   `connections:write` scope and store it as `SLACK_APP_TOKEN`.
4. **Install to Workspace**, then store the bot token as `SLACK_BOT_TOKEN`.
5. Store `ANTHROPIC_API_KEY`.
6. On the database host, create the role with the stored password:

   ```bash
   SLACKBOT_POSTGRES_PASSWORD=$(aws secretsmanager get-secret-value --region us-east-2 \
     --secret-id uwflow/slackbot --query SecretString --output text \
     | python3 -c 'import json,sys; print(json.load(sys.stdin)["SLACKBOT_POSTGRES_PASSWORD"])')
   docker exec -i postgres psql -U postgres -d flow -v password="$SLACKBOT_POSTGRES_PASSWORD" < flow/slackbot/role.sql
   ```

   Rerun it after migrations that add tables the bot should read.
7. Build and start it. The Compose service is behind the `slackbot` profile, so
   it only runs when named:

   ```bash
   script/build.sh slackbot
   script/deploy.sh slackbot
   ```

8. Invite it to a channel with `/invite @uwflow-data` and ask a question.
