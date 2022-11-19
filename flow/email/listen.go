package main

import (
	"context"
	"fmt"

	"flow/email/process"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func dispatch(ctx context.Context, tx pgx.Tx, source string) error {
	switch source {
	case "password_reset":
		return process.Reset(ctx, tx)
	case "section_subscribed":
		return process.Subscribed(ctx, tx)
	case "section_vacated":
		return process.Vacated(ctx, tx)
	default:
		return fmt.Errorf("unknown source: %s", source)
	}
}

// listen listens for Postgres notifications on 'queue'.
func listen(ctx context.Context, pool *pgxpool.Pool) error {
	conn, err := pool.Acquire(ctx)
	if err != nil {
		return fmt.Errorf("acquiring connection: %w", err)
	}
	pgconn := conn.Conn()
	defer conn.Release()

	_, err = conn.Exec(ctx, "LISTEN queue")
	if err != nil {
		return fmt.Errorf("sending LISTEN: %w", err)
	}

	for {
		notif, err := pgconn.WaitForNotification(ctx)
		if err != nil {
			return fmt.Errorf("waiting for notification: %w", err)
		}

		tx, err := pool.Begin(ctx)
		if err != nil {
			return fmt.Errorf("opening transaction: %w", err)
		}

		err = dispatch(ctx, tx, notif.Payload)
		if err != nil {
			return fmt.Errorf("servicing notification: %w", err)
		}

		err = tx.Commit(ctx)
		if err != nil {
			return fmt.Errorf("committing: %w", err)
		}
		tx.Rollback(ctx)
	}
}
