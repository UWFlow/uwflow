-- Courses a user plans to take in a future term (the /plan page).
-- Mirrors user_course_taken, but is user-editable via Hasura.
CREATE TABLE user_course_plan (
  user_id INT NOT NULL
    REFERENCES "user"(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  course_id INT NOT NULL
    REFERENCES course(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  term_id INT NOT NULL,
  PRIMARY KEY(user_id, term_id, course_id)
);

CREATE INDEX user_course_plan_user_id_fkey ON user_course_plan(user_id);

-- Degree requirement checklists maintained by UW Flow (seeded below, updated
-- by maintainers via SQL). `requirements` is an ordered array of categories:
--   [{"category": "Computer science", "courses": [["cs135","cs115"], ...]}]
-- Each entry of `courses` is a list of alternatives ("one of").
-- ponytail: flat one-of lists only; "n additional courses from X" style
-- requirements need a richer schema if we ever want them.
CREATE TABLE checklist (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  requirements JSONB NOT NULL
);

INSERT INTO checklist(name, requirements) VALUES
(
  'Honours Computer Science (core)',
  '[
    {
      "category": "Computer science",
      "courses": [
        ["cs135", "cs115", "cs145"],
        ["cs136", "cs146"],
        ["cs136l"],
        ["cs240", "cs240e"],
        ["cs241", "cs241e"],
        ["cs245", "cs245e"],
        ["cs246", "cs246e"],
        ["cs251", "cs251e"],
        ["cs341"],
        ["cs350"]
      ]
    },
    {
      "category": "Mathematics",
      "courses": [
        ["math135", "math145"],
        ["math136", "math146"],
        ["math137", "math147"],
        ["math138", "math148"],
        ["math239", "math249"],
        ["stat230", "stat240"],
        ["stat231", "stat241"]
      ]
    },
    {
      "category": "Communication",
      "courses": [
        ["engl109", "engl119", "spcom100", "spcom223", "emls101r", "emls102r", "engl129r"],
        ["engl209", "engl210e", "engl210f", "spcom225", "spcom227", "spcom228", "emls103r"]
      ]
    }
  ]'::jsonb
),
(
  'Honours Mathematics (core)',
  '[
    {
      "category": "Mathematics core",
      "courses": [
        ["math135", "math145"],
        ["math136", "math146"],
        ["math137", "math147"],
        ["math138", "math148"],
        ["math235", "math245"],
        ["math237", "math247", "math239", "math249"],
        ["stat230", "stat240"],
        ["stat231", "stat241"]
      ]
    },
    {
      "category": "Computer science",
      "courses": [
        ["cs115", "cs135", "cs145"],
        ["cs116", "cs136", "cs146"]
      ]
    },
    {
      "category": "Communication",
      "courses": [
        ["engl109", "engl119", "spcom100", "spcom223", "emls101r", "emls102r", "engl129r"]
      ]
    }
  ]'::jsonb
),
(
  'Software Engineering (core)',
  '[
    {
      "category": "Software engineering",
      "courses": [
        ["se101"],
        ["se212"],
        ["se350"],
        ["se463"],
        ["se464", "cs446", "ece452"],
        ["se465", "cs447", "ece453"]
      ]
    },
    {
      "category": "Computer science",
      "courses": [
        ["cs137"],
        ["cs138"],
        ["cs240", "cs240e"],
        ["cs241", "cs241e"],
        ["cs247"],
        ["cs341"],
        ["cs343"],
        ["cs348"],
        ["cs349"]
      ]
    },
    {
      "category": "Mathematics",
      "courses": [
        ["math115"],
        ["math117"],
        ["math119"],
        ["math135", "math145"],
        ["math239", "math249"],
        ["stat206"]
      ]
    },
    {
      "category": "Engineering",
      "courses": [
        ["ece105"],
        ["ece106"],
        ["ece124"],
        ["ece140"],
        ["ece222"],
        ["ece358"],
        ["msci261"]
      ]
    }
  ]'::jsonb
);
