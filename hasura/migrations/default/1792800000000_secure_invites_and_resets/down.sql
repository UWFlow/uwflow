-- Expired invitations and reset tokens cannot be restored on rollback.
ALTER TABLE public.shared_group_member DROP CONSTRAINT verified_members_only;
DELETE FROM queue.password_reset;
ALTER TABLE queue.password_reset DROP CONSTRAINT key_length;
ALTER TABLE queue.password_reset ADD CONSTRAINT key_length CHECK (length(secret_key) = 6);
