package db

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/env"
)

// Context-aware database connection
type Conn struct {
	// Contexts are actually pointers internally, so no need to indirect again
	ctx context.Context
	// Need pooling to support concurrent operations
	pool *pgxpool.Pool
}

// Connection to database must complete within this timeframe
const ConnectTimeout = time.Second * 10

// Connect to Database
func Connect(ctx context.Context, env *env.Environment) (*Conn, error) {
	uri := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		env.PostgresUser, env.PostgresPassword,
		env.PostgresHost, env.PostgresPort, env.PostgresDatabase,
	)
	connectCtx, cancel := context.WithTimeout(ctx, ConnectTimeout)
	defer cancel()

	pool, err := pgxpool.Connect(connectCtx, uri)
	if err != nil {
		return nil, fmt.Errorf("database connection failed: %w", err)
	}
	return &Conn{ctx: ctx, pool: pool}, nil
}

func (db *Conn) Exec(query string, args ...interface{}) (pgconn.CommandTag, error) {
	return db.pool.Exec(db.ctx, query, args...)
}

func (db *Conn) Query(query string, args ...interface{}) (pgx.Rows, error) {
	return db.pool.Query(db.ctx, query, args...)
}

func (db *Conn) QueryRow(query string, args ...interface{}) pgx.Row {
	return db.pool.QueryRow(db.ctx, query, args...)
}
