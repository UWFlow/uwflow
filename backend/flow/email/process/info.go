package process

import (
	"flow/email/format"

	"github.com/jackc/pgx/v4"
)

// queueInfo fully describes a queue table.
type queueInfo struct {
	// readQuery fetches new items from the queue.
	readQuery string
	// writeQuery takes an item ID and marks it as seen.
	writeQuery string
	// scanOne reads one item from rows returned by readQuery.
	scanOne func(pgx.Rows) (format.QueueItem, error)
}

var resetInfo = queueInfo{
	readQuery: `
SELECT pr.user_id, u.email, u.first_name, pr.secret_key
FROM queue.password_reset pr
  JOIN "user" u ON u.id = pr.user_id
WHERE pr.seen_at is NULL
	`,
	writeQuery: `
UPDATE queue.password_reset SET seen_at = NOW() WHERE user_id = $1
	`,
	scanOne: scanOneReset,
}

var subscribedInfo = queueInfo{
	readQuery: `
WITH existing_course_sub AS (
  SELECT DISTINCT cs.course_id
  FROM queue.section_subscribed ss
    JOIN course_section cs on cs.id = ss.section_id
  WHERE ss.seen_at IS NOT NULL
)
SELECT ss.id, u.email, u.first_name, c.code
FROM queue.section_subscribed ss
  INNER JOIN "user" u
          ON u.id = ss.user_id
  INNER JOIN course_section cs
          ON cs.id = ss.section_id
  INNER JOIN course c
          ON c.id = cs.course_id
   LEFT JOIN existing_course_sub ex
          ON ex.course_id = cs.course_id
WHERE ss.seen_at IS NULL
  AND ex.course_id IS NULL
	`,
	writeQuery: `
UPDATE queue.section_subscribed SET seen_at = NOW() WHERE id = $1
	`,
	scanOne: scanOneSubscribed,
}

var vacatedInfo = queueInfo{
	readQuery: `
SELECT sv.id, u.email, u.first_name, c.code, sv.section_names
FROM queue.section_vacated sv
  JOIN "user" u ON u.id = sv.user_id
  JOIN course c on c.id = sv.course_id
WHERE sv.seen_at is NULL
	`,
	writeQuery: `
UPDATE queue.section_vacated SET seen_at = NOW() WHERE id = $1
	`,
	scanOne: scanOneVacated,
}
