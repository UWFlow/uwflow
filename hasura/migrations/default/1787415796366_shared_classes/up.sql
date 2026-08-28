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
