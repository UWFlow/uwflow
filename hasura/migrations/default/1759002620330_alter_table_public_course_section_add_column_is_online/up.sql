alter table "public"."course_section" add column "is_online" Boolean
not null default 'false';

alter table "work"."course_section_delta" add column "is_online" Boolean
not null default 'false';
