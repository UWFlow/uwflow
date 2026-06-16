// Package clickhouse wraps the official clickhouse-go/v2 driver with a
// buffered, asynchronous batch writer for the events-analytics pipeline.
//
// Design goals (see AGENTS / docs/analytics.md):
//   - Ingestion is fire-and-forget: Enqueue never blocks the HTTP handler and
//     never errors out of band. If the buffer is full or ClickHouse is
//     unreachable, events are dropped with a log line — we never block a page.
//   - Writes are batched (by size or by interval) to keep insert overhead low.
package clickhouse

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"flow/common/env"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

const (
	// Channel capacity. Once full, Enqueue drops rather than blocks.
	// At ~10k events/day this is enormous headroom; it only matters during a
	// burst while ClickHouse is briefly unreachable.
	defaultBufferSize = 8192
	// Flush when this many rows are buffered.
	defaultBatchSize = 500
	// Flush at least this often, even if the batch isn't full.
	defaultFlushInterval = 5 * time.Second
	// Bound per-insert work so a stuck server can't wedge the writer goroutine.
	insertTimeout = 10 * time.Second
)

// Event is one row destined for analytics.events. Field order is documentation
// only; the writer names columns explicitly when appending to a batch.
type Event struct {
	Name      string
	TS        time.Time
	AnonID    string
	SessionID string
	URL       string
	Referrer  string
	IPHash    string
	UserAgent string
	Props     string // raw JSON text
}

// Writer owns the ClickHouse connection and the background flush goroutine.
type Writer struct {
	conn  driver.Conn
	db    string
	ch    chan Event
	wg    sync.WaitGroup
	close chan struct{}

	// counts dropped events so we can log periodically rather than per-drop.
	dropMu  sync.Mutex
	dropped uint64
}

// Connect opens a ClickHouse connection using the native protocol and starts
// the background writer. The connection is lazy: the driver dials on first use,
// so this does not fail if ClickHouse is briefly down at boot. Returns an error
// only on bad configuration.
func Connect(ctx context.Context, e *env.Environment) (*Writer, error) {
	addr := fmt.Sprintf("%s:%s", e.ClickhouseHost, e.ClickhousePort)

	conn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{addr},
		Auth: clickhouse.Auth{
			Database: e.ClickhouseDatabase,
			Username: e.ClickhouseUser,
			Password: e.ClickhousePassword,
		},
		// Keep the pool tiny: a single batching goroutine does all the writing.
		MaxOpenConns:    4,
		MaxIdleConns:    2,
		ConnMaxLifetime: time.Hour,
		DialTimeout:     5 * time.Second,
	})
	if err != nil {
		return nil, fmt.Errorf("opening clickhouse: %w", err)
	}

	w := &Writer{
		conn:  conn,
		db:    e.ClickhouseDatabase,
		ch:    make(chan Event, defaultBufferSize),
		close: make(chan struct{}),
	}

	w.wg.Add(1)
	go w.run()

	return w, nil
}

// Enqueue hands an event to the async writer. It never blocks: if the buffer is
// full (e.g. ClickHouse is down and the backlog filled up), the event is
// dropped and counted. Safe for concurrent use.
func (w *Writer) Enqueue(ev Event) {
	select {
	case w.ch <- ev:
	default:
		w.dropMu.Lock()
		w.dropped++
		dropped := w.dropped
		w.dropMu.Unlock()
		// Log on the first drop and then every 1000 to avoid log spam.
		if dropped == 1 || dropped%1000 == 0 {
			log.Printf("clickhouse: event buffer full, dropped %d events total", dropped)
		}
	}
}

// run is the background loop: it accumulates events and flushes on batch size
// or on a timer, whichever comes first.
func (w *Writer) run() {
	defer w.wg.Done()

	ticker := time.NewTicker(defaultFlushInterval)
	defer ticker.Stop()

	batch := make([]Event, 0, defaultBatchSize)

	flush := func() {
		if len(batch) == 0 {
			return
		}
		w.insert(batch)
		batch = batch[:0]
	}

	for {
		select {
		case ev := <-w.ch:
			batch = append(batch, ev)
			if len(batch) >= defaultBatchSize {
				flush()
			}
		case <-ticker.C:
			flush()
		case <-w.close:
			// Drain whatever is buffered, then flush and exit.
			for {
				select {
				case ev := <-w.ch:
					batch = append(batch, ev)
					if len(batch) >= defaultBatchSize {
						flush()
					}
				default:
					flush()
					return
				}
			}
		}
	}
}

// insert writes one batch. On any error it logs and drops the batch — the
// pipeline favours availability of the app over completeness of analytics.
func (w *Writer) insert(events []Event) {
	ctx, cancel := context.WithTimeout(context.Background(), insertTimeout)
	defer cancel()

	batch, err := w.conn.PrepareBatch(ctx, fmt.Sprintf(
		"INSERT INTO %s.events (name, ts, anonymous_id, session_id, url, referrer, ip_hash, user_agent, props)",
		w.db,
	))
	if err != nil {
		log.Printf("clickhouse: prepare batch failed, dropping %d events: %s", len(events), err)
		return
	}

	for _, ev := range events {
		if err := batch.Append(
			ev.Name, ev.TS, ev.AnonID, ev.SessionID,
			ev.URL, ev.Referrer, ev.IPHash, ev.UserAgent, ev.Props,
		); err != nil {
			log.Printf("clickhouse: append failed, dropping %d events: %s", len(events), err)
			_ = batch.Abort()
			return
		}
	}

	if err := batch.Send(); err != nil {
		log.Printf("clickhouse: send batch failed, dropping %d events: %s", len(events), err)
		return
	}
}

// Close flushes the buffer and shuts down the background writer. Safe to call
// once; intended for graceful shutdown.
func (w *Writer) Close() error {
	close(w.close)
	w.wg.Wait()
	return w.conn.Close()
}
