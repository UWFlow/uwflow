-- admin console: a flag marking staff accounts, and an append-only record of
-- every impersonation session they open.

ALTER TABLE "user" ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Admins are rare; a partial index keeps the "list all admins" lookup cheap
-- without carrying an entry for every ordinary user.
CREATE INDEX user_is_admin_idx ON "user"(id) WHERE is_admin;

-- One row per impersonation session. Written before the token is handed out,
-- so a session cannot exist without a record of it. `ended_at` is filled in
-- when the admin exits deliberately; it stays NULL if they simply let the
-- token expire, so absence of an end time is not an anomaly.
CREATE TABLE admin_impersonation_log (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL
    REFERENCES "user"(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  target_user_id INT NOT NULL
    REFERENCES "user"(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  reason TEXT
    CONSTRAINT admin_impersonation_log_reason_length CHECK (LENGTH(reason) <= 500),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- The console's default view is "most recent sessions first".
CREATE INDEX admin_impersonation_log_started_at_idx
  ON admin_impersonation_log(started_at DESC);

CREATE INDEX admin_impersonation_log_admin_id_idx
  ON admin_impersonation_log(admin_id);
