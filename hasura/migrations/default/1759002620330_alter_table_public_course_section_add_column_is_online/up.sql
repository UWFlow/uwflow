ALTER TABLE "public"."course_section" ADD COLUMN "is_online" BOOLEAN
NOT NULL DEFAULT 'false';

ALTER TABLE "work"."course_section_delta" ADD COLUMN "is_online" BOOLEAN
NOT NULL DEFAULT 'false';
