-- Shared Classes: small groups where members compare the schedules Flow
-- already stores and see which sections they share. No schedule data is
-- duplicated here; these tables only record group membership.

CREATE TABLE shared_group (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
    CONSTRAINT shared_group_name_length CHECK (LENGTH(name) BETWEEN 1 AND 80),
  created_by INT NOT NULL
    REFERENCES "user"(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX shared_group_created_by_idx ON shared_group(created_by);

CREATE FUNCTION enforce_shared_group_owner_limit()
RETURNS TRIGGER AS $$
DECLARE
  owned_group_count INT;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.created_by = OLD.created_by THEN
    RETURN NEW;
  END IF;

  -- Serialize ownership checks for this user so concurrent inserts cannot
  -- both observe fewer than five groups and exceed the limit.
  PERFORM 1 FROM "user" WHERE id = NEW.created_by FOR UPDATE;

  SELECT COUNT(*)
  INTO owned_group_count
  FROM shared_group
  WHERE created_by = NEW.created_by;

  IF owned_group_count >= 5 THEN
    RAISE EXCEPTION 'A user cannot own more than 5 shared groups'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_shared_group_owner_limit
BEFORE INSERT OR UPDATE OF created_by ON shared_group
FOR EACH ROW EXECUTE FUNCTION enforce_shared_group_owner_limit();

-- One row per person in a group. A 'pending' row is how an invite is
-- represented: it is created on invite, flips to 'member' on accept, and is
-- deleted on decline. Only 'member' rows contribute to shared-class results.
CREATE TABLE shared_group_member (
  group_id INT NOT NULL
    REFERENCES shared_group(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  user_id INT NOT NULL
    REFERENCES "user"(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CONSTRAINT shared_group_member_status CHECK (status IN ('pending', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT shared_group_member_pkey PRIMARY KEY (group_id, user_id)
);

CREATE INDEX shared_group_member_user_id_idx ON shared_group_member(user_id);

-- A pending shared_group_member row can only represent an invite to someone
-- who already has an account, since it is keyed by user id. This table covers
-- the other case: an invite addressed to an email with no account behind it.
-- The row is deleted once it is converted into a shared_group_member on
-- sign-up, or on decline, the same way a pending member row is.
CREATE TABLE shared_group_invite (
  id SERIAL PRIMARY KEY,
  group_id INT NOT NULL
    REFERENCES shared_group(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  invited_email TEXT NOT NULL
    CONSTRAINT shared_group_invite_email_length CHECK (LENGTH(invited_email) <= 256)
    CONSTRAINT shared_group_invite_email_format
      CHECK (invited_email ~* '^[A-Z0-9._%+*-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$'),
  invited_by INT NOT NULL
    REFERENCES "user"(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  -- The token in the emailed link. It is what lets the recipient act on the
  -- invite: they have no session to be identified by until they sign up.
  secret_key TEXT NOT NULL
    CONSTRAINT shared_group_invite_secret_key_unique UNIQUE
    DEFAULT REPLACE(GEN_RANDOM_UUID()::TEXT, '-', ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- The mail service scans for a NULL here and stamps it once the invite has
  -- been sent. Without it every notification would re-mail every outstanding
  -- invite, since a scan reads all unsent rows rather than the one that fired.
  mailed_at TIMESTAMPTZ DEFAULT NULL,
  CONSTRAINT shared_group_invite_unique UNIQUE (group_id, invited_email)
);

CREATE INDEX shared_group_invite_group_id_idx ON shared_group_invite(group_id);

-- The queue tables the mail service reads all name a "user" row it takes the
-- recipient address off, which is what limits mail to people who already have
-- an account. An invite carries its own address, so it is notified on directly
-- and needs no queue table standing in front of it.
CREATE TRIGGER notify_shared_group_invite AFTER INSERT ON shared_group_invite
FOR EACH STATEMENT EXECUTE PROCEDURE sendmail_notify('shared_group_invite');
