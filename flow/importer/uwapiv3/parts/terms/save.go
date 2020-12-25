package terms

import (
	"fmt"

	"flow/common/util"

	"github.com/jackc/pgx/v4"
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

func (t *termImporter) save() error {
	tx, err := t.db.Begin(t.ctx)
	if err != nil {
		return fmt.Errorf("opening transaction: %w", err)
	}
	defer tx.Rollback(t.ctx)

	_, err = tx.Exec(t.ctx, truncateTermQuery)
	if err != nil {
		return fmt.Errorf("truncating work table: %w", err)
	}

	preparedTerms := make([][]interface{}, len(t.terms))
	for i, term := range t.terms {
		preparedTerms[i] = util.AsSlice(term)
	}

	_, err = tx.CopyFrom(
		t.ctx, pgx.Identifier{"work", "term_delta"},
		util.Fields(t.terms),
		pgx.CopyFromRows(preparedTerms),
	)
	if err != nil {
		return fmt.Errorf("copying data: %w", err)
	}

	tag, err := tx.Exec(t.ctx, updateTermQuery)
	if err != nil {
		return fmt.Errorf("applying update: %w", err)
	}
	t.result.Updated = int(tag.RowsAffected())

	tag, err = tx.Exec(t.ctx, insertTermQuery)
	if err != nil {
		return fmt.Errorf("inserting: %w", err)
	}
	t.result.Inserted = int(tag.RowsAffected())

	err = tx.Commit(t.ctx)
	if err != nil {
		return fmt.Errorf("committing: %w", err)
	}

	return nil
}
