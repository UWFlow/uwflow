package db

import (
	"context"
	"fmt"
	"time"

  "flow/common/env"

	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
)

type Conn interface {
  Begin(context.Context) (pgx.Tx, error)
  Exec(context.Context, string, ...interface{}) (pgconn.CommandTag, error)
  Query(context.Context, string, ...interface{}) (pgx.Rows, error)
  QueryRow(context.Context, string, ...interface{}) pgx.Row
}

// Connection to database must complete within this timeframe.
const ConnectTimeout = time.Second * 10

// Connect to database.
func Connect(ctx context.Context, env *env.Environment) (Conn, error) {
	uri := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		env.PostgresUser, env.PostgresPassword,
		env.PostgresHost, env.PostgresPort, env.PostgresDatabase,
	)
	connectCtx, cancel := context.WithTimeout(ctx, ConnectTimeout)
	defer cancel()

  pool, err := pgxpool.Connect(connectCtx, uri)
  if err != nil {
    return nil, err
  }
  return Conn(pool), nil
}
