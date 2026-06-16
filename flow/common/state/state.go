package state

import (
	"context"
	"fmt"

	"flow/common/clickhouse"
	"flow/common/db"
	"flow/common/env"
)

// State is the collection of all conceptually "global" data.
// The same State object is shared between many goroutines.
// As such, it must only contain thread-safe entities.
// - env.Environment is read-only after initialization, thus thread-safe.
// - db.Conn is documented as thread-safe in db.go
// - clickhouse.Writer is an async, concurrency-safe event sink.
type State struct {
	Db         *db.Conn
	Clickhouse *clickhouse.Writer
	Env        *env.Environment
}

func New(ctx context.Context, serviceName string) (*State, error) {
	stenv := new(env.Environment)
	if err := env.Get(stenv); err != nil {
		return nil, fmt.Errorf("loading environment failed: %w", err)
	}

	db, err := db.ConnectPool(ctx, stenv)
	if err != nil {
		return nil, fmt.Errorf("connecting to database failed: %w", err)
	}

	ch, err := clickhouse.Connect(ctx, stenv)
	if err != nil {
		return nil, fmt.Errorf("connecting to clickhouse failed: %w", err)
	}

	return &State{Db: db, Clickhouse: ch, Env: stenv}, nil
}
