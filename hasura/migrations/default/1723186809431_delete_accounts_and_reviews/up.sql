-- Up migration to delete reviews on account deletion

ALTER TABLE review
DROP CONSTRAINT review_user_id_fkey,
ADD CONSTRAINT review_user_id_fkey
   FOREIGN KEY (user_id) REFERENCES "user"(id)
   ON UPDATE CASCADE ON DELETE CASCADE;
