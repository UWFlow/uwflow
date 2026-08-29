-- Shared Classes, read side. The tables in 1787415796366_shared_classes record
-- membership; everything a client reads about a group is derived here, so that
-- Hasura can serve it under row-level permissions and the API needs no
-- endpoint of its own for reads.

-- The Quest id of the term that is current by system time, matching
-- util.DateToTermId in the Go tree.
CREATE FUNCTION current_term_id() RETURNS INT
LANGUAGE SQL STABLE AS $$
  SELECT (EXTRACT(YEAR FROM CURRENT_DATE)::INT - 1900) * 10
    + CASE
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 9 THEN 9
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 5 THEN 5
        ELSE 1
      END
$$;

-- How many people have actually joined a group. Tracked as a computed field on
-- shared_group, so an invite can show "4 members" without the invitee being
-- able to read the member rows themselves.
CREATE FUNCTION shared_group_member_count(shared_group_row shared_group) RETURNS INT
LANGUAGE SQL STABLE AS $$
  SELECT COUNT(*)::INT FROM shared_group_member m
  WHERE m.group_id = shared_group_row.id AND m.status = 'member'
$$;

-- Member rows with the name to show for each. The "user" table is readable
-- only as yourself, and widening that to serve group member lists would expose
-- every account; this exposes the two name columns and nothing else, and only
-- for rows a permission on this view admits.
CREATE VIEW shared_group_member_name AS
SELECT m.group_id, m.user_id, m.status, m.created_at,
  u.first_name, u.last_name
FROM shared_group_member m
  JOIN "user" u ON u.id = m.user_id;

-- One row per member per section that two or more confirmed members of their
-- group hold, which is the whole point of the feature: the sections a group has
-- in common, and never the rest of anybody's schedule.
--
-- Written as an EXISTS rather than a GROUP BY over a CTE so that the group_id
-- a permission adds is pushed down into the scan instead of the intersection
-- being computed for every group on every query.
--
-- user_schedule is only pruned for the term being imported, so it keeps every
-- schedule a member has ever uploaded. The term bound is >= rather than = the
-- current term because parse accepts next-term schedules, which should show as
-- soon as they are in.
CREATE VIEW shared_group_shared_class AS
SELECT m.group_id, us.section_id, us.user_id
FROM shared_group_member m
  JOIN user_schedule us ON us.user_id = m.user_id
  JOIN course_section cs ON cs.id = us.section_id
WHERE m.status = 'member'
  AND cs.term_id >= current_term_id()
  AND EXISTS (
    SELECT 1
    FROM shared_group_member m2
      JOIN user_schedule us2 ON us2.user_id = m2.user_id
    WHERE m2.group_id = m.group_id
      AND m2.status = 'member'
      AND us2.section_id = us.section_id
      AND us2.user_id <> us.user_id
  );
