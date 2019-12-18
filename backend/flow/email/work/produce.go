package work

import (
	"context"
	"flow/common/db"
	"flow/email/common"
	"flow/email/produce/password_reset"
	"flow/email/produce/section_subscribed"
	"flow/email/produce/section_vacated"
	"fmt"
)

func dispatch(tx *db.Tx, source string, mch chan *common.MailItem) error {
	switch source {
	case "password_reset":
		return password_reset.Produce(tx, mch)
	case "section_subscribed":
		return section_subscribed.Produce(tx, mch)
	case "section_vacated":
		return section_vacated.Produce(tx, mch)
	default:
		return fmt.Errorf("unknown source: %s", source)
	}
}

func produceEmailItems(conn *db.Conn, mch chan *common.MailItem, ech chan error) {
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

		err = dispatch(tx, notif.Payload, mch)
		if err != nil {
			ech <- fmt.Errorf("servicing notification: %w", err)
		}

		err = tx.Commit()
		if err != nil {
			ech <- fmt.Errorf("committing: %w", err)
		}
		tx.Rollback()
	}
}
