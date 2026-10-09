// Package embedding keeps course_embedding in sync with course text so the
// API can serve semantic search. Only courses whose document or embedding
// model changed since the last run are sent to the embeddings API.
package embedding

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
	"unicode"

	"flow/common/embed"
	"flow/common/state"
	"flow/importer/uw/log"
)

// Inputs per embeddings API request; well under the API's per-request limit.
const batchSize = 100

const selectStaleQuery = `
SELECT c.id, c.code, c.name, COALESCE(c.description, '')
FROM course c
  LEFT JOIN course_embedding e ON e.course_id = c.id
WHERE e.course_id IS NULL
   OR e.model <> $1
   OR e.content_hash <> encode(sha256(convert_to(
        $2 || c.code || $3 || c.name || $4 || COALESCE(c.description, ''),
        'UTF8')), 'hex')
`

const upsertQuery = `
INSERT INTO course_embedding(course_id, model, content_hash, embedding, updated_at)
VALUES ($1, $2, $3, $4, NOW())
ON CONFLICT (course_id) DO UPDATE SET
  model = EXCLUDED.model,
  content_hash = EXCLUDED.content_hash,
  embedding = EXCLUDED.embedding,
  updated_at = EXCLUDED.updated_at
`

// Separators for the hashed key. They cannot appear in course fields, so
// distinct (code, name, description) triples never hash to the same key.
const (
	hashPrefix = "v1\x1f"
	hashSep    = "\x1f"
)

type course struct {
	id          int
	code        string
	name        string
	description string
}

// contentHash must match the expression in selectStaleQuery.
func contentHash(c course) string {
	sum := sha256.Sum256([]byte(hashPrefix + c.code + hashSep + c.name + hashSep + c.description))
	return hex.EncodeToString(sum[:])
}

// formatCode turns a stored code such as "cs135" into "CS 135".
func formatCode(code string) string {
	code = strings.ToUpper(code)
	for i, r := range code {
		if unicode.IsDigit(r) {
			return code[:i] + " " + code[i:]
		}
	}
	return code
}

// document is the text embedded for a course.
func document(c course) string {
	doc := formatCode(c.code) + ": " + c.name
	if c.description != "" {
		doc += ". " + c.description
	}
	return doc
}

func Refresh(ctx context.Context, state *state.State) error {
	if state.Env.OpenAIApiKey == "" {
		log.Warnf("OPENAI_API_KEY is not set, skipping course embeddings")
		return nil
	}

	courses, err := selectStale(state)
	if err != nil {
		return err
	}

	log.StartImport("course_embedding")
	client := embed.NewClient(state.Env.OpenAIApiKey)
	var result log.DbResult
	for start := 0; start < len(courses); start += batchSize {
		batch := courses[start:min(start+batchSize, len(courses))]
		if err := embedBatch(ctx, state, client, batch); err != nil {
			return fmt.Errorf("embedding courses %d-%d: %w", start, start+len(batch), err)
		}
		result.Updated += len(batch)
	}
	log.EndImport("course_embedding", &result)
	return nil
}

func selectStale(state *state.State) ([]course, error) {
	rows, err := state.Db.Query(selectStaleQuery, embed.Model, hashPrefix, hashSep, hashSep)
	if err != nil {
		return nil, fmt.Errorf("selecting stale courses: %w", err)
	}
	defer rows.Close()

	var courses []course
	for rows.Next() {
		var c course
		if err := rows.Scan(&c.id, &c.code, &c.name, &c.description); err != nil {
			return nil, fmt.Errorf("reading course row: %w", err)
		}
		courses = append(courses, c)
	}
	return courses, rows.Err()
}

// embedBatch calls the API outside the transaction, then commits the batch
// on its own so one failure does not discard earlier progress.
func embedBatch(ctx context.Context, state *state.State, client *embed.Client, batch []course) error {
	docs := make([]string, len(batch))
	for i, c := range batch {
		docs[i] = document(c)
	}

	vectors, err := client.Embed(ctx, docs)
	if err != nil {
		return err
	}

	tx, err := state.Db.Begin()
	if err != nil {
		return fmt.Errorf("opening transaction: %w", err)
	}
	defer tx.Rollback()

	for i, c := range batch {
		_, err := tx.Exec(upsertQuery, c.id, embed.Model, contentHash(c), vectors[i])
		if err != nil {
			return fmt.Errorf("upserting %s: %w", c.code, err)
		}
	}
	return tx.Commit()
}
