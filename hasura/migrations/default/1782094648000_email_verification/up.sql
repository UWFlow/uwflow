-- Email verification for new email/password signups.
-- Existing accounts default to verified = TRUE so they are not locked out;
-- new registrations insert verified = FALSE (see flow/api/auth/email.go).
ALTER TABLE secret.user_email
  ADD COLUMN verified BOOLEAN NOT NULL DEFAULT TRUE;

-- Mirrors queue.password_reset: one pending code per user, emailed by the
-- mail worker via the sendmail_notify('email_verify') trigger.
CREATE TABLE queue.email_verify(
    user_id INT PRIMARY KEY
      REFERENCES "user"(id)
      ON UPDATE CASCADE
      ON DELETE CASCADE,
    secret_key TEXT NOT NULL
      CONSTRAINT email_verify_key_length CHECK (LENGTH(secret_key) = 6),
    expiry TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    seen_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TRIGGER notify_email_verify AFTER INSERT ON queue.email_verify
FOR EACH STATEMENT EXECUTE PROCEDURE sendmail_notify('email_verify');
