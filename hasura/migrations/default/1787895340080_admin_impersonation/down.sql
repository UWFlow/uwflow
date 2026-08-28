DROP TABLE admin_impersonation_log;

DROP INDEX user_is_admin_idx;

ALTER TABLE "user" DROP COLUMN is_admin;
