package mcp

import (
	"bytes"
	"context"
	"embed"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"
)

//go:embed queries/*.graphql
var queryFiles embed.FS

// Each query is the frontend's own document, so the MCP reads exactly what
// the website reads. Freshness follows the data: enrollment (in the course
// document) changes with every import, ratings and reviews rarely.
var queries = map[string]struct {
	file string
	ttl  time.Duration
}{
	"course":         {"queries/course.graphql", time.Minute},
	"course_reviews": {"queries/course_reviews.graphql", 10 * time.Minute},
	"prof":           {"queries/prof.graphql", 10 * time.Minute},
	"prof_reviews":   {"queries/prof_reviews.graphql", 10 * time.Minute},
	"explore":        {"queries/explore.graphql", 10 * time.Minute},
	"explore_all":    {"queries/explore_all.graphql", 10 * time.Minute},
}

// errUpstream marks failures of Hasura itself, as opposed to missing data.
var errUpstream = errors.New("hasura request failed")

type querier interface {
	query(ctx context.Context, name string, vars map[string]any, out any) error
}

// hasuraClient posts documents to Hasura without credentials, so Hasura
// applies its unauthorized role: the same view as a logged-out visitor.
type hasuraClient struct {
	url   string
	http  *http.Client
	cache *cache
	docs  map[string]string
}

const (
	maxResponseBytes = 16 << 20
	cacheBytes       = 32 << 20
)

func newHasuraClient(url string, httpClient *http.Client) (*hasuraClient, error) {
	docs := make(map[string]string, len(queries))
	for name, q := range queries {
		doc, err := queryFiles.ReadFile(q.file)
		if err != nil {
			return nil, fmt.Errorf("reading %s: %w", q.file, err)
		}
		docs[name] = string(doc)
	}
	return &hasuraClient{url: url, http: httpClient, cache: newCache(cacheBytes), docs: docs}, nil
}

func (c *hasuraClient) query(ctx context.Context, name string, vars map[string]any, out any) error {
	doc, ok := c.docs[name]
	if !ok {
		return fmt.Errorf("unknown query %q", name)
	}
	key, err := json.Marshal([]any{name, vars})
	if err != nil {
		return fmt.Errorf("encoding cache key: %w", err)
	}
	data, ok := c.cache.get(string(key))
	if !ok {
		data, err = c.post(ctx, doc, vars)
		if err != nil {
			return err
		}
		c.cache.put(string(key), data, queries[name].ttl)
	}
	if err := json.Unmarshal(data, out); err != nil {
		return fmt.Errorf("%w: decoding %s: %w", errUpstream, name, err)
	}
	return nil
}

func (c *hasuraClient) post(ctx context.Context, doc string, vars map[string]any) ([]byte, error) {
	body, err := json.Marshal(map[string]any{"query": doc, "variables": vars})
	if err != nil {
		return nil, fmt.Errorf("encoding request: %w", err)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.url, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("building request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", errUpstream, err)
	}
	defer resp.Body.Close()

	var envelope struct {
		Data   json.RawMessage `json:"data"`
		Errors []struct {
			Message string `json:"message"`
		} `json:"errors"`
	}
	decoder := json.NewDecoder(io.LimitReader(resp.Body, maxResponseBytes))
	if err := decoder.Decode(&envelope); err != nil {
		return nil, fmt.Errorf("%w: status %d: %w", errUpstream, resp.StatusCode, err)
	}
	if len(envelope.Errors) > 0 {
		return nil, fmt.Errorf("%w: %s", errUpstream, envelope.Errors[0].Message)
	}
	if resp.StatusCode != http.StatusOK || len(envelope.Data) == 0 {
		return nil, fmt.Errorf("%w: status %d", errUpstream, resp.StatusCode)
	}
	return envelope.Data, nil
}

// cache keeps raw response bytes, so callers decode their own copy and never
// share mutable values. It is bounded by size: one course's reviews run to
// hundreds of kilobytes and the full search index to several megabytes.
type cache struct {
	mu       sync.Mutex
	maxBytes int
	size     int
	entries  map[string]cacheEntry
	now      func() time.Time
}

type cacheEntry struct {
	data    []byte
	expires time.Time
}

func newCache(maxBytes int) *cache {
	return &cache{maxBytes: maxBytes, entries: make(map[string]cacheEntry), now: time.Now}
}

func (c *cache) get(key string) ([]byte, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	e, ok := c.entries[key]
	if !ok || !c.now().Before(e.expires) {
		return nil, false
	}
	return e.data, true
}

func (c *cache) put(key string, data []byte, ttl time.Duration) {
	if len(data) > c.maxBytes {
		return
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	c.remove(key)
	now := c.now()
	if c.size+len(data) > c.maxBytes {
		for k, e := range c.entries {
			if !now.Before(e.expires) {
				c.remove(k)
			}
		}
	}
	for k := range c.entries {
		if c.size+len(data) <= c.maxBytes {
			break
		}
		c.remove(k)
	}
	c.entries[key] = cacheEntry{data: data, expires: now.Add(ttl)}
	c.size += len(data)
}

func (c *cache) remove(key string) {
	if e, ok := c.entries[key]; ok {
		c.size -= len(e.data)
		delete(c.entries, key)
	}
}
