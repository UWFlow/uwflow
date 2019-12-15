package work

import (
	"context"
	"flow/common/db"
	"flow/common/util"
	"flow/email/produce"
	"fmt"
)

func dispatch(tx *db.Tx, source string, mch chan util.MailItem) error {
	switch source {
	case "password_reset":
		return produce.ResetProduce(tx, mch)
	case "section_subscribed":
		return produce.SubscribedProduce(tx, mch)
	case "section_vacated":
		return produce.VacatedProduce(tx, mch)
	default:
		return fmt.Errorf("unknown source: %s", source)
	}
}

func produceEmailItems(conn *db.Conn, mch chan util.MailItem, ech chan error) {
	ctx := context.Background()

	pgxconn, err := conn.Acquire()
	if err != nil {
		ech <- fmt.Errorf("acquiring connection: %w", err)
	}
	defer pgxconn.Release()

	_, err = pgxconn.Exec(ctx, "LISTEN queue")
	if err != nil {
		ech <- fmt.Errorf("sending LISTEN: %w", err)
	}

	for {
		notif, err := pgxconn.Conn().WaitForNotification(ctx)
		if err != nil {
			ech <- fmt.Errorf("waiting for notification: %w", err)
		}

		tx, err := conn.Begin()
		if err != nil {
			ech <- fmt.Errorf("opening transaction: %w", err)
		}
		defer tx.Rollback()

		err = dispatch(tx, notif.Payload, mch)
		if err != nil {
			ech <- fmt.Errorf("servicing notification: %w", err)
		}

		err = tx.Commit()
		if err != nil {
			ech <- fmt.Errorf("committing: %w", err)
		}
	}
}
