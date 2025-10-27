CREATE TABLE public.course_term_delivery_modes (
    course_id integer NOT NULL,
    term_id integer NOT NULL,
    delivery_mode text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (course_id, term_id),
    FOREIGN KEY (course_id) REFERENCES public.course(id) ON DELETE CASCADE,
    FOREIGN KEY (term_id) REFERENCES public.term(id) ON DELETE CASCADE,
    CHECK (delivery_mode IN ('ONLINE_ONLY', 'IN_PERSON_ONLY', 'BOTH', 'N_A'))
);

CREATE INDEX idx_course_term_delivery_modes_course_id ON public.course_term_delivery_modes (course_id);
CREATE INDEX idx_course_term_delivery_modes_term_id ON public.course_term_delivery_modes (term_id);
CREATE INDEX idx_course_term_delivery_modes_delivery_mode ON public.course_term_delivery_modes (delivery_mode);