package term

import "github.com/AyushK1/uwflow2.0/backend/uwapi-importer/db"

const InsertQuery = `
INSERT INTO term_date(term, start_date, end_date) VALUES ($1, $2, $3)
ON CONFLICT (term) DO UPDATE
SET start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date
`

func Insert(conn *db.Conn, term *Term) error {
  _, err := conn.Exec(InsertQuery, term.TermId, term.StartDate, term.EndDate)
  return err
}

func InsertAll(conn *db.Conn, terms []Term) error {
  for _, term := range terms {
    err := Insert(conn, &term)
    if err != nil {
      return err
    }
  }
  return nil
}
