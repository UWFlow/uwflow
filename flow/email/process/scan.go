package process

import (
	"context"
	"fmt"
	"strings"

	"flow/email/format"

	"github.com/jackc/pgx/v5"
)

func scanReset(ctx context.Context, tx pgx.Tx) ([]format.QueueItem, error) {
	var items []format.QueueItem

	const query = `
SELECT pr.user_id, u.email, u.first_name, pr.secret_key
FROM queue.password_reset pr
  JOIN "user" u ON u.id = pr.user_id
WHERE pr.seen_at is NULL
`

	rows, err := tx.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("loading rows: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		item := new(format.ResetItem)
		if err := rows.Scan(&item.ID, &item.Email, &item.UserName, &item.SecretKey); err != nil {
			return nil, fmt.Errorf("scanning row: %w", err)
		}
		items = append(items, item)
	}

	return items, nil
}

func scanSubscribed(ctx context.Context, tx pgx.Tx) ([]format.QueueItem, error) {
	var items []format.QueueItem

	const markQuery = `
WITH counted AS (
	SELECT cs.course_id, ss.user_id
	FROM queue.section_subscribed ss
		JOIN course_section cs ON cs.id = ss.section_id
	WHERE ss.seen_at IS NOT NULL
	GROUP BY cs.course_id, ss.user_id
)
UPDATE queue.section_subscribed ss
SET seen_at = NOW()
FROM counted c
  JOIN course_section cs ON cs.course_id = c.course_id
WHERE ss.section_id = cs.id
	AND c.user_id = ss.user_id
	AND ss.seen_at IS NULL
`
	if _, err := tx.Exec(ctx, markQuery); err != nil {
		return nil, fmt.Errorf("marking same-course entries: %w", err)
	}

	const scanQuery = `
SELECT ss.id, u.email, u.first_name, c.code
FROM queue.section_subscribed ss
  INNER JOIN "user" u
          ON u.id = ss.user_id
  INNER JOIN course_section cs
          ON cs.id = ss.section_id
  INNER JOIN course c
          ON c.id = cs.course_id
WHERE ss.seen_at IS NULL
`

	rows, err := tx.Query(ctx, scanQuery)
	if err != nil {
		return nil, fmt.Errorf("loading rows: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		item := new(format.SubscribedItem)
		if err := rows.Scan(&item.ID, &item.Email, &item.UserName, &item.CourseCode); err != nil {
			return nil, err
		}
		item.CourseURL = "https://uwflow.com/course/" + item.CourseCode
		item.CourseCode = strings.ToUpper(item.CourseCode)
		items = append(items, item)
	}

	return items, nil
}

func scanVacated(ctx context.Context, tx pgx.Tx) ([]format.QueueItem, error) {
	var items []format.QueueItem

	const query = `
SELECT sv.id, u.email, u.first_name, c.code, sv.section_names
FROM queue.section_vacated sv
  JOIN "user" u ON u.id = sv.user_id
  JOIN course c on c.id = sv.course_id
WHERE sv.seen_at is NULL
`

	rows, err := tx.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("loading rows: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		item := new(format.VacatedItem)
		if err := rows.Scan(&item.ID, &item.Email, &item.UserName, &item.CourseCode, &item.SectionNames); err != nil {
			return nil, fmt.Errorf("scanning row: %w", err)
		}
		item.CourseURL = "https://uwflow.com/course/" + item.CourseCode
		item.CourseCode = strings.ToUpper(item.CourseCode)
		items = append(items, item)
	}

	return items, nil
}
