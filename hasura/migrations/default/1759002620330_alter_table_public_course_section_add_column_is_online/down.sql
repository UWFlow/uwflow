ALTER TABLE public.course_section 
DROP COLUMN IF EXISTS is_online;

ALTER TABLE work.course_section_delta
DROP COLUMN IF EXISTS is_online;

