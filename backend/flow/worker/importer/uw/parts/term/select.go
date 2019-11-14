package term

import (
  "context"
	"time"

  "github.com/jackc/pgx/v4/pgxpool"
)

const SelectQuery = `SELECT term, start_date, end_date FROM term_date`

func SelectAll(ctx context.Context, conn *pgxpool.Pool) ([]Term, error) {
	var terms []Term

	rows, err := conn.Query(ctx, SelectQuery)
	if err != nil {
		return terms, err
	}
	defer rows.Close()

	for rows.Next() {
		var termId int
		var startDate, endDate time.Time
		err = rows.Scan(&termId, &startDate, &endDate)
		if err != nil {
			return terms, err
		}
		terms = append(
			terms,
			Term{Id: termId, StartDate: startDate, EndDate: endDate},
		)
	}

	return terms, nil
}
