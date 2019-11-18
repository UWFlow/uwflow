package state

import (
	"context"
	"fmt"

	"flow/common/db"
	"flow/common/env"

	"go.uber.org/zap"
)

// State is the collection of all conceptually "global" data.
// The same State object is shared between many goroutines.
// As such, it must only contain thread-safe entities.
// - env.Environment is read-only after initialization, thus thread-safe.
// - db.Conn is documented as thread-safe in db.go
// - zap.Logger is documented as thread-safe by authors.
type State struct {
	Db  *db.Conn
	Env *env.Environment
	Log *zap.Logger
}

func New(ctx context.Context) (*State, error) {
	env, err := env.Get()
	if err != nil {
		return nil, fmt.Errorf("loading environment failed: %w", err)
	}

	log, err := zap.NewProduction(zap.AddCallerSkip(1))
	if err != nil {
		return nil, fmt.Errorf("initializing logger failed: %w", err)
	}

	db, err := db.ConnectPool(ctx, env)
	if err != nil {
		return nil, fmt.Errorf("connecting to database failed: %w", err)
	}

	return &State{Db: db, Env: env, Log: log}, nil
}
