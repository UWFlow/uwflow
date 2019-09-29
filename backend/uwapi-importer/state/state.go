package state

import (
	"context"
	"fmt"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/api"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/db"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/env"

	"go.uber.org/zap"
)

type State struct {
	Api *api.Api
	Db  *db.Conn
	Env *env.Environment
	Log *zap.Logger
}

func New(ctx context.Context) (*State, error) {
	env, err := env.Get()
	if err != nil {
		return nil, fmt.Errorf("loading environment failed: %w", err)
	}
	// Skip immediate caller: our logging statements are all wrapped
	log, err := zap.NewProduction(zap.AddCallerSkip(1))
	if err != nil {
		return nil, fmt.Errorf("initializing logger failed: %w", err)
	}
	db, err := db.Connect(ctx, env)
	if err != nil {
		return nil, fmt.Errorf("connecting to database failed: %w", err)
	}
	api := api.New(ctx, env, log)

	return &State{Api: api, Db: db, Env: env, Log: log}, nil
}
