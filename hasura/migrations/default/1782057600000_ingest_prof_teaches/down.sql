BEGIN;

CREATE OR REPLACE VIEW public.prof_teaches_course AS
SELECT course_id, prof_id
FROM materialized.prof_teaches_course;

DROP TABLE public.prof_teaches_course_ingestion;

COMMIT;
