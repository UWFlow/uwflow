BEGIN;

CREATE TABLE public.prof_teaches_course_ingestion (
  term_code INT NOT NULL
    REFERENCES public.term(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  term_name TEXT NOT NULL
    CONSTRAINT prof_teaches_course_ingestion_term_name_length
      CHECK (LENGTH(term_name) BETWEEN 1 AND 256),
  course_id INT NOT NULL
    REFERENCES public.course(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  course_code TEXT NOT NULL
    CONSTRAINT prof_teaches_course_ingestion_course_code_length
      CHECK (LENGTH(course_code) BETWEEN 1 AND 16),
  instructor TEXT NOT NULL
    CONSTRAINT prof_teaches_course_ingestion_instructor_length
      CHECK (LENGTH(instructor) BETWEEN 1 AND 256),
  prof_id INT NOT NULL
    REFERENCES public.prof(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  scraped_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT prof_teaches_course_ingestion_pkey
    PRIMARY KEY (term_code, course_id, instructor)
);

CREATE INDEX prof_teaches_course_ingestion_prof_id_fkey
  ON public.prof_teaches_course_ingestion(prof_id);

CREATE OR REPLACE VIEW public.prof_teaches_course AS
SELECT course_id, prof_id
FROM materialized.prof_teaches_course
UNION
SELECT course_id, prof_id
FROM public.prof_teaches_course_ingestion;

COMMIT;
