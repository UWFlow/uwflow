package term

import (
  "context"

  "flow/worker/importer/uw/log"

  "github.com/jackc/pgx/v4/pgxpool"
)

const InsertQuery = `
INSERT INTO term_date(term, start_date, end_date) VALUES ($1, $2, $3)
ON CONFLICT (term) DO UPDATE
SET start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date
`

func InsertAll(ctx context.Context, conn *pgxpool.Pool, terms []Term) (*log.DbResult, error) {
	var result log.DbResult

	for _, term := range terms {
		_, err := conn.Exec(ctx, InsertQuery, term.Id, term.StartDate, term.EndDate)
		if err != nil {
			return nil, err
		}
	}
	result.Inserted = len(terms)
	return &result, nil
}
