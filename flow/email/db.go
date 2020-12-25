package main

import (
	"context"
	"fmt"
	"time"

	"flow/common/env"

	"github.com/jackc/pgx/v4/pgxpool"
)

var connectTimeout = 5 * time.Second

func connect(ctx context.Context) (*pgxpool.Pool, error) {
	var pg struct {
		Database string `from:"POSTGRES_DB"`
		Host     string `from:"POSTGRES_HOST"`
		Password string `from:"POSTGRES_PASSWORD"`
		Port     string `from:"POSTGRES_PORT"`
		User     string `from:"POSTGRES_USER"`
	}

	if err := env.Get(&pg); err != nil {
		return nil, err
	}

	uri := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		pg.User, pg.Password, pg.Host, pg.Port, pg.Database,
	)

	connectCtx, cancel := context.WithTimeout(ctx, connectTimeout)
	defer cancel()

	return pgxpool.Connect(connectCtx, uri)
}
