-- Keep the Quest-imported user_schedule unchanged. Each row below is only a
-- planned replacement over one still-enrolled source section.
CREATE TABLE user_schedule_swap (
  user_id INT NOT NULL,
  source_section_id INT NOT NULL,
  replacement_section_id INT NOT NULL
    REFERENCES course_section(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT user_schedule_swap_pkey
    PRIMARY KEY (user_id, source_section_id),
  CONSTRAINT user_schedule_swap_source_fkey
    FOREIGN KEY (user_id, source_section_id)
    REFERENCES user_schedule(user_id, section_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT user_schedule_swap_changes_section
    CHECK (source_section_id <> replacement_section_id)
);

CREATE INDEX user_schedule_swap_replacement_section_id_idx
ON user_schedule_swap(replacement_section_id);

CREATE FUNCTION validate_user_schedule_swap_sections()
RETURNS TRIGGER AS $$
DECLARE
  source_term_id INT;
  replacement_term_id INT;
  source_section_type TEXT;
  replacement_section_type TEXT;
BEGIN
  SELECT
    source.term_id,
    replacement.term_id,
    SPLIT_PART(source.section_name, ' ', 1),
    SPLIT_PART(replacement.section_name, ' ', 1)
  INTO
    source_term_id,
    replacement_term_id,
    source_section_type,
    replacement_section_type
  FROM course_section AS source
  CROSS JOIN course_section AS replacement
  WHERE source.id = NEW.source_section_id
    AND replacement.id = NEW.replacement_section_id;

  -- Missing sections are reported by the table's foreign keys.
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  IF source_term_id <> replacement_term_id THEN
    RAISE EXCEPTION 'Schedule swap sections must belong to the same term'
      USING ERRCODE = '23514';
  END IF;

  IF source_section_type <> replacement_section_type THEN
    RAISE EXCEPTION 'Schedule swap sections must have the same component type'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_user_schedule_swap_sections
BEFORE INSERT OR UPDATE OF source_section_id, replacement_section_id
ON user_schedule_swap
FOR EACH ROW
EXECUTE FUNCTION validate_user_schedule_swap_sections();
