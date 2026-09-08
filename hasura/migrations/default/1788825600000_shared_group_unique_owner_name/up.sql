ALTER TABLE public.shared_group
  ADD CONSTRAINT shared_group_created_by_name_key UNIQUE (created_by, name);
