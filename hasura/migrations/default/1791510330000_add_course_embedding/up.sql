-- Course vectors for semantic search. Written by the importer and read by the
-- API; intentionally not tracked by Hasura, so it is not exposed over GraphQL.
CREATE TABLE course_embedding (
  course_id INT PRIMARY KEY
    REFERENCES course(id) ON DELETE CASCADE ON UPDATE CASCADE,
  model TEXT NOT NULL,
  -- Hash of the embedded document, used to skip unchanged courses.
  content_hash TEXT NOT NULL,
  embedding REAL[] NOT NULL
    CONSTRAINT course_embedding_not_empty CHECK (CARDINALITY(embedding) > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
