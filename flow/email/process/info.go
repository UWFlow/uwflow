package process

import (
	"context"

	"flow/email/format"

	"github.com/jackc/pgx/v5"
)

// queueInfo fully describes a queue table.
type queueInfo struct {
	// scanFunc loads new items from the queue.
	scanFunc func(context.Context, pgx.Tx) ([]format.QueueItem, error)
	// writeQuery takes an item ID and marks it as seen.
	writeQuery string
}

var resetInfo = queueInfo{
	scanFunc:   scanReset,
	writeQuery: `UPDATE queue.password_reset SET seen_at = NOW() WHERE user_id = $1`,
}

var subscribedInfo = queueInfo{
	scanFunc:   scanSubscribed,
	writeQuery: `UPDATE queue.section_subscribed SET seen_at = NOW() WHERE id = $1`,
}

var vacatedInfo = queueInfo{
	scanFunc:   scanVacated,
	writeQuery: `UPDATE queue.section_vacated SET seen_at = NOW() WHERE id = $1`,
}
