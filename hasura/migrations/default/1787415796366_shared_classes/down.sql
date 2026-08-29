DROP TRIGGER IF EXISTS notify_shared_group_invite ON shared_group_invite;
DROP TABLE IF EXISTS shared_group_invite;
DROP TABLE IF EXISTS shared_group_member;
DROP TRIGGER IF EXISTS enforce_shared_group_owner_limit ON shared_group;
DROP FUNCTION IF EXISTS enforce_shared_group_owner_limit();
DROP TABLE IF EXISTS shared_group;
