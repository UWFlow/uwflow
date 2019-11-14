package state

import (
	"context"
	"fmt"

	"flow/common/env"
	"flow/common/db"

	"github.com/jackc/pgx/v4/pgxpool"
	"go.uber.org/zap"
)

// State is the collection of all conceptually "global" data.
// The same State object is shared between many goroutines.
// As such, it must only contain thread-safe entities.
// - env.Environment is read-only after initialization, thus thread-safe.
// - context.Context, pgxpool.Pool and zap.Logger are documented as thread-safe.
type State struct {
  Ctx context.Context
	Env *env.Environment
	Db  *pgxpool.Pool
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
	db, err := db.Connect(ctx, env)
	if err != nil {
		return nil, fmt.Errorf("connecting to database failed: %w", err)
	}

  return &State{Ctx: ctx, Db: db, Env: env, Log: log}, nil
}
