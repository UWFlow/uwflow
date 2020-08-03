package term

import (
	"fmt"

	"flow/common/db"
	"flow/common/util"
	"flow/importer/uw/log"
)

const truncateTermQuery = `TRUNCATE work.term_delta`

const updateTermQuery = `
UPDATE term SET
  start_date = delta.start_date,
  end_date   = delta.end_date
FROM work.term_delta delta
WHERE term.id = delta.id
`

const insertTermQuery = `
INSERT INTO term(id, start_date, end_date)
SELECT
  d.id, d.start_date, d.end_date
FROM work.term_delta d
  LEFT JOIN term t ON t.id = d.id
WHERE t.id IS NULL
`

func insertAll(conn *db.Conn, terms []Term) (*log.DbResult, error) {
	var result log.DbResult

	tx, err := conn.Begin()
	if err != nil {
		return &result, fmt.Errorf("failed to open transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec(truncateTermQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to truncate work table: %w", err)
	}

	preparedTerms := make([][]interface{}, len(terms))
	for i, term := range terms {
		preparedTerms[i] = util.AsSlice(term)
	}

	_, err = tx.CopyFrom(
		db.Identifier{"work", "term_delta"},
		util.Fields(terms),
		preparedTerms,
	)
	if err != nil {
		return &result, fmt.Errorf("failed to copy data: %w", err)
	}

	tag, err := tx.Exec(updateTermQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to apply update: %w", err)
	}
	result.Updated = int(tag.RowsAffected())

	tag, err = tx.Exec(insertTermQuery)
	if err != nil {
		return &result, fmt.Errorf("failed to insert: %w", err)
	}
	result.Inserted = int(tag.RowsAffected())

	err = tx.Commit()
	if err != nil {
		return &result, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return &result, nil
}
