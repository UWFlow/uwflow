package db

import (
	"context"

	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v4"
)

type Conn interface {
  Begin(context.Context) (pgx.Tx, error)
  Exec(context.Context, string, ...interface{}) (pgconn.CommandTag, error)
  Query(context.Context, string, ...interface{}) (pgx.Rows, error)
  QueryRow(context.Context, string, ...interface{}) pgx.Row
}
