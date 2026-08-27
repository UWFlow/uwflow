-- Shared Classes: small groups where members compare the schedules Flow
-- already stores and see which sections they share. No schedule data is
-- duplicated here; these tables only record group membership and invites.

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

-- One row per person in a group. status is 'pending' after an invite is
-- accepted into an account but before the person opts in, and 'member' once
-- they are sharing. Only 'member' rows contribute to shared-class results.
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
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT shared_group_member_pkey PRIMARY KEY (group_id, user_id)
);

CREATE INDEX shared_group_member_user_id_idx ON shared_group_member(user_id);

-- An invite is keyed by the email it was sent to, so an invite can exist
-- before that email has a Flow account. invited_by is the member who sent it.
CREATE TABLE shared_group_invite (
  id SERIAL PRIMARY KEY,
  group_id INT NOT NULL
    REFERENCES shared_group(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  invited_email TEXT NOT NULL,
  invited_by INT NOT NULL
    REFERENCES "user"(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  status TEXT NOT NULL DEFAULT 'invited'
    CONSTRAINT shared_group_invite_status
      CHECK (status IN ('invited', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT shared_group_invite_unique UNIQUE (group_id, invited_email)
);

CREATE INDEX shared_group_invite_group_id_idx ON shared_group_invite(group_id);

-- Block list: user_id has blocked blocked_user_id from inviting them again.
-- Future invites from a blocked person are dropped silently.
CREATE TABLE shared_group_block (
  user_id INT NOT NULL
    REFERENCES "user"(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  blocked_user_id INT NOT NULL
    REFERENCES "user"(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT shared_group_block_pkey PRIMARY KEY (user_id, blocked_user_id),
  CONSTRAINT shared_group_block_not_self CHECK (user_id <> blocked_user_id)
);
