package db

import (
	"context"

	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
)

type Identifier pgx.Identifier

type Conn struct {
	ctx  context.Context
	pool *pgxpool.Pool
}

// Create new Conn with given context wrapping the same underlying pool.
func (c *Conn) With(ctx context.Context) *Conn {
	return &Conn{ctx: ctx, pool: c.pool}
}

func (c *Conn) Begin() (*Tx, error) {
	tx, err := c.pool.Begin(c.ctx)
	if err != nil {
		return nil, err
	}
	return &Tx{ctx: c.ctx, tx: tx}, nil
}

func (c *Conn) BeginWithContext(ctx context.Context) (*Tx, error) {
	tx, err := c.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	return &Tx{ctx: ctx, tx: tx}, nil
}

func (c *Conn) Exec(query string, args ...interface{}) (pgconn.CommandTag, error) {
	return c.pool.Exec(c.ctx, query, args...)
}

func (c *Conn) Query(query string, args ...interface{}) (pgx.Rows, error) {
	return c.pool.Query(c.ctx, query, args...)
}

func (c *Conn) QueryRow(query string, args ...interface{}) pgx.Row {
	return c.pool.QueryRow(c.ctx, query, args...)
}

type Tx struct {
	ctx context.Context
	tx  pgx.Tx
}

func (t *Tx) With(ctx context.Context) *Tx {
	return &Tx{ctx: ctx, tx: t.tx}
}

func (t *Tx) Commit() error {
	return t.tx.Commit(t.ctx)
}

func (t *Tx) CopyFrom(
	tableName Identifier, columnNames []string, rows [][]interface{},
) (int64, error) {
	return t.tx.CopyFrom(
		t.ctx, pgx.Identifier(tableName), columnNames, pgx.CopyFromRows(rows),
	)
}

func (t *Tx) Exec(query string, args ...interface{}) (pgconn.CommandTag, error) {
	return t.tx.Exec(t.ctx, query, args...)
}

func (t *Tx) Query(query string, args ...interface{}) (pgx.Rows, error) {
	return t.tx.Query(t.ctx, query, args...)
}

func (t *Tx) QueryRow(query string, args ...interface{}) pgx.Row {
	return t.tx.QueryRow(t.ctx, query, args...)
}

func (t *Tx) Rollback() error {
	return t.tx.Rollback(t.ctx)
}
