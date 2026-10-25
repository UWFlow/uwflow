-- Course renames: when UW renames a course (e.g. cs135 -> cs145), a maintainer
-- calls merge_course(old, new). The course keeps a single row (and so a single
-- set of reviews), its code becomes the new code, and the old code is kept here
-- so search, URLs, transcripts and the importer still resolve it.
CREATE TABLE course_alias (
  code TEXT PRIMARY KEY
    CONSTRAINT code_length CHECK (LENGTH(code) <= 16),
  course_id INT NOT NULL
    REFERENCES course(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX course_alias_course_id_fkey ON course_alias(course_id);

-- Every code, current or former, mapped to the course it now refers to
CREATE VIEW course_code_lookup AS
SELECT code, id AS course_id FROM course
UNION ALL
SELECT code, course_id FROM course_alias;

-- A code is either a live course code or an alias, never both
CREATE FUNCTION check_course_code_unaliased()
RETURNS TRIGGER AS $$
  BEGIN
    IF EXISTS(SELECT FROM course_alias WHERE code = NEW.code) THEN
      RAISE EXCEPTION 'course code % is an alias of a renamed course', NEW.code;
    END IF;
    RETURN NEW;
  END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_course_code_unaliased
BEFORE INSERT OR UPDATE OF code ON course
FOR EACH ROW EXECUTE PROCEDURE check_course_code_unaliased();

CREATE FUNCTION check_alias_not_course()
RETURNS TRIGGER AS $$
  BEGIN
    IF EXISTS(SELECT FROM course WHERE code = NEW.code) THEN
      RAISE EXCEPTION 'alias % is already a course code', NEW.code;
    END IF;
    RETURN NEW;
  END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_alias_not_course
BEFORE INSERT OR UPDATE OF code ON course_alias
FOR EACH ROW EXECUTE PROCEDURE check_alias_not_course();

-- Moving reviews between courses during a merge must not look like an edit
DROP TRIGGER set_review_updated_at ON review;
CREATE TRIGGER set_review_updated_at
BEFORE UPDATE ON review
FOR EACH ROW
WHEN (OLD.course_id IS NOT DISTINCT FROM NEW.course_id)
EXECUTE PROCEDURE set_updated_at();

-- Rename old_code to new_code. If the importer already created a row for
-- new_code, everything attached to it is moved onto the old row first.
-- Idempotent: does nothing if old_code is already an alias of new_code.
CREATE FUNCTION merge_course(old_code TEXT, new_code TEXT)
RETURNS VOID AS $$
  DECLARE
    keep_id INT;
    drop_id INT;
  BEGIN
    old_code := LOWER(old_code);
    new_code := LOWER(new_code);

    IF old_code = new_code THEN
      RAISE EXCEPTION 'merge_course: old and new code are both %', old_code;
    END IF;

    IF EXISTS(
      SELECT FROM course_alias a JOIN course c ON c.id = a.course_id
      WHERE a.code = old_code AND c.code = new_code
    ) THEN
      RETURN;
    END IF;

    SELECT id INTO keep_id FROM course WHERE code = old_code;
    IF keep_id IS NULL THEN
      RAISE EXCEPTION 'merge_course: no course with code %', old_code;
    END IF;
    IF EXISTS(SELECT FROM course_alias WHERE code = new_code) THEN
      RAISE EXCEPTION 'merge_course: % is already an alias', new_code;
    END IF;
    SELECT id INTO drop_id FROM course WHERE code = new_code;

    IF drop_id IS NOT NULL THEN
      -- A user who reviewed both codes keeps their most recent review
      DELETE FROM review r USING review o
      WHERE r.user_id = o.user_id
        AND r.course_id IN (keep_id, drop_id)
        AND o.course_id IN (keep_id, drop_id)
        AND r.course_id <> o.course_id
        AND (r.updated_at, r.id) < (o.updated_at, o.id);
      UPDATE review SET course_id = keep_id WHERE course_id = drop_id;

      DELETE FROM user_course_taken d USING user_course_taken k
      WHERE d.course_id = drop_id AND k.course_id = keep_id
        AND d.user_id = k.user_id AND d.term_id = k.term_id;
      UPDATE user_course_taken SET course_id = keep_id WHERE course_id = drop_id;

      DELETE FROM user_shortlist d USING user_shortlist k
      WHERE d.course_id = drop_id AND k.course_id = keep_id
        AND d.user_id = k.user_id;
      UPDATE user_shortlist SET course_id = keep_id WHERE course_id = drop_id;

      DELETE FROM course_term_delivery_modes d USING course_term_delivery_modes k
      WHERE d.course_id = drop_id AND k.course_id = keep_id
        AND d.term_id = k.term_id;
      UPDATE course_term_delivery_modes SET course_id = keep_id WHERE course_id = drop_id;

      UPDATE course_section SET course_id = keep_id WHERE course_id = drop_id;
      UPDATE queue.section_vacated SET course_id = keep_id WHERE course_id = drop_id;
      UPDATE course_alias SET course_id = keep_id WHERE course_id = drop_id;

      -- Requisites: repoint both sides, dropping duplicates and self-references
      DELETE FROM course_prerequisite d USING course_prerequisite k
      WHERE d.course_id = drop_id AND k.course_id = keep_id
        AND d.prerequisite_id = k.prerequisite_id;
      UPDATE course_prerequisite SET course_id = keep_id WHERE course_id = drop_id;
      DELETE FROM course_prerequisite d USING course_prerequisite k
      WHERE d.prerequisite_id = drop_id AND k.prerequisite_id = keep_id
        AND d.course_id = k.course_id;
      UPDATE course_prerequisite SET prerequisite_id = keep_id WHERE prerequisite_id = drop_id;
      DELETE FROM course_prerequisite WHERE course_id = keep_id AND prerequisite_id = keep_id;

      DELETE FROM course_antirequisite d USING course_antirequisite k
      WHERE d.course_id = drop_id AND k.course_id = keep_id
        AND d.antirequisite_id = k.antirequisite_id;
      UPDATE course_antirequisite SET course_id = keep_id WHERE course_id = drop_id;
      DELETE FROM course_antirequisite d USING course_antirequisite k
      WHERE d.antirequisite_id = drop_id AND k.antirequisite_id = keep_id
        AND d.course_id = k.course_id;
      UPDATE course_antirequisite SET antirequisite_id = keep_id WHERE antirequisite_id = drop_id;
      DELETE FROM course_antirequisite WHERE course_id = keep_id AND antirequisite_id = keep_id;

      -- Grades table is added by a migration that may not have landed yet
      IF to_regclass('public.user_course_grade') IS NOT NULL THEN
        EXECUTE 'DELETE FROM user_course_grade d USING user_course_grade k
          WHERE d.course_id = $2 AND k.course_id = $1
            AND d.user_id = k.user_id AND d.term_id = k.term_id'
          USING keep_id, drop_id;
        EXECUTE 'UPDATE user_course_grade SET course_id = $1 WHERE course_id = $2'
          USING keep_id, drop_id;
      END IF;

      -- The new code's row holds the current calendar text
      UPDATE course k SET
        name = d.name,
        description = d.description,
        prereqs = d.prereqs,
        coreqs = d.coreqs,
        antireqs = d.antireqs,
        authoritative = k.authoritative OR d.authoritative
      FROM course d
      WHERE k.id = keep_id AND d.id = drop_id;

      DELETE FROM course WHERE id = drop_id;
    END IF;

    UPDATE course SET code = new_code WHERE id = keep_id;
    INSERT INTO course_alias(code, course_id) VALUES (old_code, keep_id);

    REFRESH MATERIALIZED VIEW materialized.course_rating;
    REFRESH MATERIALIZED VIEW materialized.prof_teaches_course;
    REFRESH MATERIALIZED VIEW materialized.course_search_index;
    REFRESH MATERIALIZED VIEW materialized.prof_search_index;
  END;
$$ LANGUAGE plpgsql;

-- Recreate the search index so former codes are searchable
DROP TRIGGER refresh_section_meeting ON section_meeting;
DROP TRIGGER refresh_course_section ON course_section;

DROP FUNCTION refresh_section_meeting_views;
DROP FUNCTION search_courses;
DROP FUNCTION search_profs;

DROP VIEW course_search_index;
DROP MATERIALIZED VIEW materialized.course_search_index;

CREATE MATERIALIZED VIEW materialized.course_search_index AS
SELECT
  course.id                                   AS course_id,
  course.code                                 AS code,
  course.name                                 AS name,
  ARRAY_TO_STRING(REGEXP_MATCHES(
    course.code, '^(.+?)[0-9]'), '')          AS course_letters,
  materialized.course_rating.filled_count     AS ratings,
  materialized.course_rating.liked            AS liked,
  materialized.course_rating.easy             AS easy,
  materialized.course_rating.useful           AS useful,
  COALESCE(ARRAY_AGG(DISTINCT course_section.term_id)
    FILTER (WHERE course_section.term_id IS NOT NULL),
    ARRAY[]::INT[])                           AS terms,
  COALESCE(ARRAY_AGG(DISTINCT course_section.term_id)
    FILTER (WHERE course_section.term_id IS NOT NULL
            AND course_section.enrollment_total < course_section.enrollment_capacity),
    ARRAY[]::INT[])                           AS terms_with_seats,
  COALESCE(ARRAY_AGG(DISTINCT materialized.prof_teaches_course.prof_id)
    FILTER (WHERE materialized.prof_teaches_course.prof_id IS NOT NULL),
    ARRAY[]::INT[])                           AS prof_ids,
  COALESCE(ARRAY_AGG(DISTINCT course_section.term_id)
    FILTER (WHERE course_section.is_online=True),
    ARRAY[]::INT[]) as terms_with_online_sections,
  -- check if prereqs are either empty or null
  COALESCE(TRIM(course.prereqs), '') != '' OR
    COALESCE(ARRAY_LENGTH(ARRAY_AGG(
      DISTINCT course_prerequisite.course_id)
      FILTER (WHERE course_prerequisite.course_id IS NOT NULL),
    1), 0) > 0                                AS has_prereqs,
  -- former codes of this course, see merge_course
  COALESCE((SELECT ARRAY_AGG(ca.code ORDER BY ca.code)
    FROM course_alias ca WHERE ca.course_id = course.id),
    ARRAY[]::TEXT[])                          AS aliases,
  to_tsvector('simple', course.code) ||
  to_tsvector('simple', course.name) ||
  -- index course numbers to support queries where the course code is split
  -- ie) the query "ECE 105" should match both "ECE" and "105" because
  -- the frontend will translate the raw query to "ECE:* & 105:*"
  to_tsvector('simple', ARRAY_TO_STRING(REGEXP_MATCHES(course.code,
    '^[a-z|A-Z]+([0-9]+[a-z|A-Z]*)'), '')) ||
  -- index former codes and their numbers the same way
  to_tsvector('simple', COALESCE((SELECT STRING_AGG(
    ca.code || ' ' || REGEXP_REPLACE(ca.code, '^[a-z|A-Z]+', ''), ' ')
    FROM course_alias ca WHERE ca.course_id = course.id), ''))
                                              AS document
FROM course
  LEFT JOIN course_prerequisite ON course_prerequisite.course_id = course.id
  LEFT JOIN course_section ON course_section.course_id = course.id
  LEFT JOIN materialized.prof_teaches_course ON materialized.prof_teaches_course.course_id = course.id
  LEFT JOIN materialized.course_rating ON materialized.course_rating.course_id = course.id
GROUP BY course.id, ratings, liked, easy, useful;

CREATE INDEX idx_course_search ON materialized.course_search_index USING GIN(document);

CREATE VIEW course_search_index AS
SELECT * FROM materialized.course_search_index;

CREATE FUNCTION refresh_section_meeting_views()
RETURNS TRIGGER AS $$
  BEGIN
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.course_rating;';
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.prof_rating;';
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.prof_teaches_course;';
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.course_search_index;';
    EXECUTE 'REFRESH MATERIALIZED VIEW materialized.prof_search_index;';
    RETURN NULL;
  END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION search_courses(query TEXT, code_only BOOLEAN)
RETURNS SETOF course_search_index AS $$
  BEGIN
    IF code_only THEN
      RETURN QUERY
      SELECT * FROM course_search_index
        WHERE course_letters ILIKE query
          OR EXISTS(SELECT FROM unnest(aliases) a
            WHERE REGEXP_REPLACE(a, '[0-9].*$', '') ILIKE query)
      ORDER BY ratings DESC;
    ELSE
      RETURN QUERY
      SELECT * FROM course_search_index
        WHERE document @@ to_tsquery('simple', query)
      UNION
      SELECT DISTINCT * FROM (SELECT unnest(course_ids) AS course_id
        FROM prof_search_index
        WHERE document @@ to_tsquery('simple', query)) prof_courses
        LEFT JOIN course_search_index USING (course_id)
      ORDER BY ratings DESC;
    END IF;
  END
$$ LANGUAGE plpgsql STABLE;

CREATE FUNCTION search_profs(query TEXT, code_only BOOLEAN)
RETURNS SETOF prof_search_index AS $$
  BEGIN
    IF code_only THEN
      RETURN QUERY
      SELECT DISTINCT * FROM (SELECT unnest(prof_ids) AS prof_id
        FROM course_search_index
        WHERE course_letters ILIKE query) course_profs
        LEFT JOIN prof_search_index USING (prof_id)
      ORDER BY ratings DESC;
    ELSE
      RETURN QUERY
      SELECT * FROM prof_search_index
        WHERE document @@ to_tsquery('simple', query)
      UNION
      SELECT DISTINCT * FROM (SELECT unnest(prof_ids) AS prof_id
        FROM course_search_index
        WHERE document @@ to_tsquery('simple', query)) course_profs
        LEFT JOIN prof_search_index USING (prof_id)
      ORDER BY ratings DESC;
    END IF;
  END;
$$ LANGUAGE plpgsql STABLE;

CREATE TRIGGER refresh_section_meeting
AFTER INSERT OR UPDATE OR DELETE ON section_meeting
FOR EACH STATEMENT
EXECUTE PROCEDURE refresh_section_meeting_views();

CREATE TRIGGER refresh_course_section
AFTER INSERT OR UPDATE OR DELETE ON course_section
FOR EACH STATEMENT
EXECUTE PROCEDURE refresh_section_meeting_views();
