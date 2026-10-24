-- Outstanding short reset codes and unverified account invitations must be reissued.
DELETE FROM queue.password_reset;
ALTER TABLE queue.password_reset DROP CONSTRAINT key_length;
ALTER TABLE queue.password_reset ADD CONSTRAINT key_length CHECK (length(secret_key) = 32);
DELETE FROM public.shared_group_member WHERE status = 'pending';
-- Membership now requires the emailed bearer secret; retain the status column for clients.
ALTER TABLE public.shared_group_member ADD CONSTRAINT verified_members_only CHECK (status = 'member');
