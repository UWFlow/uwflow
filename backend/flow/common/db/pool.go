package db

import (
	"context"
	"fmt"
	"time"

  "flow/common/env"

	"github.com/jackc/pgx/v4/pgxpool"
)


// Connection to database must complete within this timeframe.
const ConnectTimeout = time.Second * 10

// Connect to database.
func ConnectPool(ctx context.Context, env *env.Environment) (Conn, error) {
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
