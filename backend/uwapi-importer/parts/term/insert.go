package term

import "github.com/AyushK1/uwflow2.0/backend/uwapi-importer/db"

const InsertQuery = `
INSERT INTO term_date(term, start_date, end_date) VALUES ($1, $2, $3)
ON CONFLICT (term) DO UPDATE
SET start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date
`

func InsertAll(conn *db.Conn, terms []Term) (*db.Result, error) {
	var result db.Result

	for _, term := range terms {
		_, err := conn.Exec(InsertQuery, term.Id, term.StartDate, term.EndDate)
		if err != nil {
			return &result, err
		}
	}
	return &result, nil
}
