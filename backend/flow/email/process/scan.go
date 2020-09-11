package process

import (
	"context"
	"fmt"
	"strings"

	"flow/email/format"

	"github.com/jackc/pgx/v4"
)

func scanOneReset(rows pgx.Rows) (format.QueueItem, error) {
	item := new(format.ResetItem)
	if err := rows.Scan(&item.ID, &item.Email, &item.UserName, &item.SecretKey); err != nil {
		return nil, err
	}
	return item, nil
}

func scanOneSubscribed(rows pgx.Rows) (format.QueueItem, error) {
	item := new(format.SubscribedItem)
	if err := rows.Scan(&item.ID, &item.Email, &item.UserName, &item.CourseCode); err != nil {
		return nil, err
	}
	item.CourseURL = "https://uwflow.com/course/" + item.CourseCode
	item.CourseCode = strings.ToUpper(item.CourseCode)
	return item, nil
}

func scanOneVacated(rows pgx.Rows) (format.QueueItem, error) {
	item := new(format.VacatedItem)
	if err := rows.Scan(&item.ID, &item.Email, &item.UserName, &item.CourseCode, &item.SectionNames); err != nil {
		return nil, err
	}
	item.CourseURL = "https://uwflow.com/course/" + item.CourseCode
	item.CourseCode = strings.ToUpper(item.CourseCode)
	return item, nil
}

// scan loads all unseen items from the table described by info.
func scan(ctx context.Context, tx pgx.Tx, info queueInfo) ([]format.QueueItem, error) {
	var items []format.QueueItem

	rows, err := tx.Query(ctx, info.readQuery)
	if err != nil {
		return nil, fmt.Errorf("loading rows: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		item, err := info.scanOne(rows)
		if err != nil {
			return nil, fmt.Errorf("scanning row: %w", err)
		}

		items = append(items, item)
	}

	return items, nil
}
