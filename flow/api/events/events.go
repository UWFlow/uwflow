// Package events implements the analytics ingestion endpoint (POST /events).
//
// Security is enforced entirely server-side — there is no browser secret key
// (a key in frontend JS is not secret). The protections are:
//   - CORS allowlist (cors.go)
//   - per-IP token-bucket rate limit (ratelimit.go)
//   - hard caps on body size, batch size, and individual field lengths
//   - strict schema validation
//
// The endpoint is fire-and-forget: it validates, hashes the client IP, hands
// rows to the async ClickHouse writer, and returns 202. It must NEVER 500 the
// page; on any internal trouble it still returns a small 4xx/2xx and logs.
package events

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net"
	"net/http"
	"regexp"
	"strings"
	"time"

	"flow/common/clickhouse"
)

const (
	// Reject bodies larger than this outright (413).
	maxBodyBytes = 64 * 1024 // 64 KiB
	// Max events accepted per request.
	maxBatchSize = 50
	// Cap individual string fields so one event can't blow up a row.
	maxFieldLen = 255
	// Cap the serialized props blob.
	maxPropsLen = 4 * 1024
	// Max length of an event name.
	maxNameLen = 64

	// Per-IP rate limit: sustained 20 events/sec with a burst of 60. A normal
	// browsing session emits far fewer; this only trips on abuse.
	rateLimitPerSecond = 20.0
	rateLimitBurst     = 60
)

// snake_case, starts with a letter, letters/digits/underscores after.
var nameRegexp = regexp.MustCompile(`^[a-z][a-z0-9_]*$`)

// inboundEvent mirrors the wire contract exactly. props is decoded as raw JSON
// so we can validate it is a flat object of scalar values before re-encoding.
type inboundEvent struct {
	Name      string          `json:"name"`
	TS        int64           `json:"ts"`
	AnonID    string          `json:"anonymous_id"`
	SessionID string          `json:"session_id"`
	URL       string          `json:"url"`
	Referrer  string          `json:"referrer"`
	Props     json.RawMessage `json:"props"`
}

type inboundBatch struct {
	Events []inboundEvent `json:"events"`
}

// Collector bundles the dependencies the handler needs. It is constructed once
// at startup and its Handler method is registered on the router.
type Collector struct {
	writer  *clickhouse.Writer
	limiter *ipRateLimiter
	ipSalt  []byte
}

// NewCollector builds a Collector. ipSalt is mixed into the IP hash so raw IPs
// are never stored.
func NewCollector(writer *clickhouse.Writer, ipSalt []byte) *Collector {
	return &Collector{
		writer:  writer,
		limiter: newIPRateLimiter(rateLimitPerSecond, rateLimitBurst),
		ipSalt:  ipSalt,
	}
}

// Handler returns the http.HandlerFunc with CORS wrapping applied.
func (c *Collector) Handler() http.HandlerFunc {
	h := http.Handler(http.HandlerFunc(c.collect))
	h = corsMiddleware(h)
	return h.ServeHTTP
}

func (c *Collector) collect(w http.ResponseWriter, r *http.Request) {
	// Defensive: this endpoint must never panic the request into a 500.
	defer func() {
		if rec := recover(); rec != nil {
			log.Printf("events: recovered from panic: %v", rec)
			w.WriteHeader(http.StatusAccepted)
		}
	}()

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	clientIP := clientIPFromRequest(r)

	// Rate limit first — cheapest rejection.
	if !c.limiter.Allow(clientIP) {
		w.WriteHeader(http.StatusTooManyRequests)
		return
	}

	// Cap body size. MaxBytesReader makes the decoder error once the limit is
	// exceeded; we translate that to 413.
	r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)
	raw, err := io.ReadAll(r.Body)
	if err != nil {
		var mbe *http.MaxBytesError
		if errors.As(err, &mbe) {
			w.WriteHeader(http.StatusRequestEntityTooLarge)
			return
		}
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var batch inboundBatch
	if err := json.Unmarshal(raw, &batch); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if len(batch.Events) == 0 {
		// Nothing to do, but not an error.
		w.WriteHeader(http.StatusAccepted)
		return
	}
	if len(batch.Events) > maxBatchSize {
		w.WriteHeader(http.StatusRequestEntityTooLarge)
		return
	}

	ipHash := c.hashIP(clientIP)
	userAgent := truncate(r.UserAgent(), maxFieldLen)
	now := time.Now()

	for i := range batch.Events {
		ev, ok := validateEvent(&batch.Events[i], now)
		if !ok {
			// Strict: a single malformed event rejects the whole batch so the
			// client notices and fixes its instrumentation.
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		ev.IPHash = ipHash
		ev.UserAgent = userAgent
		// Fire-and-forget: never blocks, never errors.
		c.writer.Enqueue(ev)
	}

	w.WriteHeader(http.StatusAccepted)
}

// validateEvent enforces the schema and converts an inbound event to a storage
// row. Returns ok=false on any violation.
func validateEvent(in *inboundEvent, now time.Time) (clickhouse.Event, bool) {
	var out clickhouse.Event

	// name: required, snake_case, bounded.
	if len(in.Name) == 0 || len(in.Name) > maxNameLen || !nameRegexp.MatchString(in.Name) {
		return out, false
	}
	// anonymous_id and session_id: required, bounded.
	if in.AnonID == "" || len(in.AnonID) > maxFieldLen {
		return out, false
	}
	if in.SessionID == "" || len(in.SessionID) > maxFieldLen {
		return out, false
	}
	// url/referrer: optional, bounded.
	if len(in.URL) > maxFieldLen || len(in.Referrer) > maxFieldLen {
		return out, false
	}

	// ts: epoch millis. Accept a sane window; fall back to server time if the
	// client clock is obviously bogus (0 / negative / absurdly far off).
	ts := time.UnixMilli(in.TS)
	if in.TS <= 0 || ts.Before(now.Add(-365*24*time.Hour)) || ts.After(now.Add(24*time.Hour)) {
		ts = now
	}

	// props: optional flat object of scalar values. Re-serialize canonically.
	propsStr, ok := validateProps(in.Props)
	if !ok {
		return out, false
	}

	out.Name = in.Name
	out.TS = ts
	out.AnonID = in.AnonID
	out.SessionID = in.SessionID
	out.URL = in.URL
	out.Referrer = in.Referrer
	out.Props = propsStr
	return out, true
}

// validateProps ensures props is a flat object of string/number/bool values
// (or absent/null) and returns its compact JSON encoding.
func validateProps(raw json.RawMessage) (string, bool) {
	if len(raw) == 0 || string(raw) == "null" {
		return "{}", true
	}
	var m map[string]json.RawMessage
	if err := json.Unmarshal(raw, &m); err != nil {
		// Not an object (e.g. array/scalar) — reject.
		return "", false
	}
	for _, v := range m {
		if !isScalarJSON(v) {
			return "", false
		}
	}
	// Re-encode compactly from the validated map.
	encoded, err := json.Marshal(m)
	if err != nil {
		return "", false
	}
	if len(encoded) > maxPropsLen {
		return "", false
	}
	return string(encoded), true
}

// isScalarJSON reports whether a JSON value is a string, number, bool, or null.
func isScalarJSON(v json.RawMessage) bool {
	var x interface{}
	if err := json.Unmarshal(v, &x); err != nil {
		return false
	}
	switch x.(type) {
	case string, float64, bool, nil:
		return true
	default:
		return false
	}
}

// hashIP returns hex(sha256(ip + salt)). The raw IP is never stored.
func (c *Collector) hashIP(ip string) string {
	h := sha256.New()
	h.Write([]byte(ip))
	h.Write(c.ipSalt)
	return hex.EncodeToString(h.Sum(nil))
}

// clientIPFromRequest extracts the client IP, honouring X-Forwarded-For set by
// the nginx reverse proxy (first hop), falling back to RemoteAddr.
func clientIPFromRequest(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		// First entry is the original client.
		parts := strings.Split(xff, ",")
		ip := strings.TrimSpace(parts[0])
		if ip != "" {
			return ip
		}
	}
	if xrip := r.Header.Get("X-Real-IP"); xrip != "" {
		return strings.TrimSpace(xrip)
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func truncate(s string, n int) string {
	if len(s) > n {
		return s[:n]
	}
	return s
}
