// Package process implements the full processing pipeline for each queue table.
package process

import (
	"context"
	"log"

	"flow/email/smtp"

	"github.com/jackc/pgx/v4"
)

func process(ctx context.Context, tx pgx.Tx, info queueInfo) error {
	items, err := info.scanFunc(ctx, tx)
	if err != nil {
		return err
	}

	for _, item := range items {
		msg, err := item.Message()
		if err != nil {
			log.Printf("templating %+v: %v", item, err)
			continue
		}
		if err := smtp.Send(msg); err != nil {
			log.Printf("sending: %v", err)
			continue
		}
		id := item.RowID()
		if _, err := tx.Exec(ctx, info.writeQuery, id); err != nil {
			log.Printf("marking id=%d done: %v", id, err)
		}
	}

	return nil
}

// Reset processes all unseen items in queue.password_reset.
func Reset(ctx context.Context, tx pgx.Tx) error {
	return process(ctx, tx, resetInfo)
}

// Subscribed processes all unseen items in queue.section_subscribed.
func Subscribed(ctx context.Context, tx pgx.Tx) error {
	return process(ctx, tx, subscribedInfo)
}

// Vacated processes all unseen items in queue.section_vacated.
func Vacated(ctx context.Context, tx pgx.Tx) error {
	return process(ctx, tx, vacatedInfo)
}
