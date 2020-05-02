package state

import (
	"context"
	"fmt"

	"flow/common/db"
	"flow/common/env"
)

// State is the collection of all conceptually "global" data.
// The same State object is shared between many goroutines.
// As such, it must only contain thread-safe entities.
// - env.Environment is read-only after initialization, thus thread-safe.
// - db.Conn is documented as thread-safe in db.go
type State struct {
	Db  *db.Conn
	Env *env.Environment
}

func New(ctx context.Context, serviceName string) (*State, error) {
	env, err := env.Get()
	if err != nil {
		return nil, fmt.Errorf("loading environment failed: %w", err)
	}

	db, err := db.ConnectPool(ctx, env)
	if err != nil {
		return nil, fmt.Errorf("connecting to database failed: %w", err)
	}

	return &State{Db: db, Env: env}, nil
}
