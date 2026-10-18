// Package search serves semantic course search. Course vectors are written
// by the importer (see importer/uw/parts/embedding); this package keeps them
// in memory, embeds the query, and ranks courses by cosine similarity.
// Brute force is fast enough here: there are only ~10k courses.
package search

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sort"
	"strings"
	"sync"
	"sync/atomic"
	"time"
	"unicode/utf8"

	"github.com/getsentry/sentry-go"

	"flow/api/serde"
	"flow/common/db"
	"flow/common/embed"
)

const (
	maxQueryLength  = 100
	resultLimit     = 5
	minScore        = 0.2
	refreshInterval = time.Hour
	reloadTimeout   = 30 * time.Second
	// Query embeddings and summaries are cached to save API calls on
	// repeated searches. Summaries expire so they pick up new ratings.
	maxCachedQueries = 1024
	summaryTTL       = time.Hour
)

const selectEmbeddingsQuery = `
SELECT c.id, c.code, c.name, e.embedding
FROM course_embedding e
  JOIN course c ON c.id = e.course_id
WHERE e.model = $1
  -- Transfer-credit placeholders (e.g. cs2xx "CS Transfer Credit") have short,
  -- generic text that outranks real courses for most short queries.
  AND c.code !~ 'xx$'
  AND c.name NOT ILIKE '%transfer credit%'
`

type Embedder interface {
	Embed(ctx context.Context, inputs []string) ([][]float32, error)
}

type entry struct {
	id     int
	code   string
	name   string
	vector []float32
}

type Result struct {
	Id    int     `json:"id"`
	Code  string  `json:"code"`
	Name  string  `json:"name"`
	Score float32 `json:"score"`
}

type response struct {
	Courses []Result `json:"courses"`
}

type Index struct {
	// A nil embedder disables semantic search; a nil streamer disables
	// summaries.
	embedder Embedder
	streamer Streamer

	mu       sync.RWMutex
	entries  []entry
	loadedAt time.Time

	// Serializes the initial load so concurrent first requests query once.
	loadMu     sync.Mutex
	refreshing atomic.Bool

	vectors      *cache[[]float32]
	summaries    *cache[summary]
	summarySlots chan struct{}
	// Replaceable so tests can run without a database.
	loadContext func(context.Context, *db.Conn, []Result) ([]courseContext, error)
}

func NewIndex(apiKey string) *Index {
	ix := newIndex()
	if apiKey != "" {
		ix.embedder = embed.NewClient(apiKey)
		ix.streamer = newChatClient(apiKey)
	}
	return ix
}

func newIndex() *Index {
	return &Index{
		vectors:      newCache[[]float32](0),
		summaries:    newCache[summary](summaryTTL),
		summarySlots: make(chan struct{}, maxConcurrentSummaries),
		loadContext:  loadCourseContext,
	}
}

// parseQuery returns the whitespace-normalized query or a 400 error.
func parseQuery(r *http.Request) (string, error) {
	query := strings.Join(strings.Fields(r.URL.Query().Get("q")), " ")
	if query == "" || utf8.RuneCountInString(query) > maxQueryLength {
		return "", serde.WithStatus(
			http.StatusBadRequest,
			fmt.Errorf("query must be 1-%d characters", maxQueryLength),
		)
	}
	return query, nil
}

func (ix *Index) Handle(conn *db.Conn, w http.ResponseWriter, r *http.Request) error {
	query, err := parseQuery(r)
	if err != nil {
		return err
	}

	results := []Result{}
	if ix.embedder != nil {
		entries, err := ix.snapshot(r.Context(), conn)
		if err != nil {
			return err
		}
		// Skip the API call until the importer has produced embeddings.
		if len(entries) > 0 {
			vector, err := ix.embedQuery(r.Context(), strings.ToLower(query))
			if err != nil {
				return fmt.Errorf("embedding query: %w", err)
			}
			results = rank(entries, vector, resultLimit, minScore)
		}
	}

	return json.NewEncoder(w).Encode(response{Courses: results})
}

// snapshot returns the current entries, loading them on first use and
// refreshing them in the background once they are stale.
func (ix *Index) snapshot(ctx context.Context, conn *db.Conn) ([]entry, error) {
	ix.mu.RLock()
	entries, loadedAt := ix.entries, ix.loadedAt
	ix.mu.RUnlock()

	if loadedAt.IsZero() {
		ix.loadMu.Lock()
		defer ix.loadMu.Unlock()

		ix.mu.RLock()
		entries, loadedAt = ix.entries, ix.loadedAt
		ix.mu.RUnlock()
		if !loadedAt.IsZero() {
			return entries, nil
		}
		return ix.reload(conn.With(ctx))
	}

	if time.Since(loadedAt) > refreshInterval && ix.refreshing.CompareAndSwap(false, true) {
		// The refresh outlives the request, so it gets its own context.
		go func() {
			defer ix.refreshing.Store(false)
			ctx, cancel := context.WithTimeout(context.Background(), reloadTimeout)
			defer cancel()
			if _, err := ix.reload(conn.With(ctx)); err != nil {
				log.Printf("Error refreshing search embeddings: %s", err)
				sentry.CaptureException(err)
			}
		}()
	}
	return entries, nil
}

func (ix *Index) reload(conn *db.Conn) ([]entry, error) {
	rows, err := conn.Query(selectEmbeddingsQuery, embed.Model)
	if err != nil {
		return nil, fmt.Errorf("querying embeddings: %w", err)
	}
	defer rows.Close()

	var entries []entry
	for rows.Next() {
		var e entry
		if err := rows.Scan(&e.id, &e.code, &e.name, &e.vector); err != nil {
			return nil, fmt.Errorf("reading embedding row: %w", err)
		}
		entries = append(entries, e)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("reading embeddings: %w", err)
	}

	ix.mu.Lock()
	ix.entries, ix.loadedAt = entries, time.Now()
	ix.mu.Unlock()
	return entries, nil
}

func (ix *Index) embedQuery(ctx context.Context, query string) ([]float32, error) {
	if vector, ok := ix.vectors.get(query); ok {
		return vector, nil
	}

	vectors, err := ix.embedder.Embed(ctx, []string{query})
	if err != nil {
		return nil, err
	}
	ix.vectors.put(query, vectors[0])
	return vectors[0], nil
}

// cache is a concurrency-safe map that is reset when full, which is simpler
// than LRU and good enough here. A zero ttl means entries never expire.
type cache[T any] struct {
	mu      sync.Mutex
	ttl     time.Duration
	entries map[string]cached[T]
}

type cached[T any] struct {
	value  T
	stored time.Time
}

func newCache[T any](ttl time.Duration) *cache[T] {
	return &cache[T]{ttl: ttl, entries: make(map[string]cached[T])}
}

func (c *cache[T]) get(key string) (T, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	entry, ok := c.entries[key]
	if !ok || (c.ttl > 0 && time.Since(entry.stored) > c.ttl) {
		var zero T
		return zero, false
	}
	return entry.value, true
}

func (c *cache[T]) put(key string, value T) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if len(c.entries) >= maxCachedQueries {
		c.entries = make(map[string]cached[T])
	}
	c.entries[key] = cached[T]{value: value, stored: time.Now()}
}

// rank returns up to limit entries scoring at least threshold, best first.
func rank(entries []entry, query []float32, limit int, threshold float32) []Result {
	results := []Result{}
	for _, e := range entries {
		if len(e.vector) != len(query) {
			continue
		}
		if score := embed.Dot(e.vector, query); score >= threshold {
			results = append(results, Result{Id: e.id, Code: e.code, Name: e.name, Score: score})
		}
	}
	sort.Slice(results, func(i, j int) bool { return results[i].Score > results[j].Score })
	if len(results) > limit {
		results = results[:limit]
	}
	return results
}
