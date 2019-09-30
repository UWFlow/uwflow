package term

import "github.com/AyushK1/uwflow2.0/backend/uwapi-importer/db"

const SelectTimeframeQuery = `SELECT term, start_date, end_date FROM term_date`

func SelectAll(conn *db.Conn) ([]Term, error) {
  var terms []Term

	rows, err := conn.Query(SelectTimeframeQuery)
	if err != nil {
		return terms, err
	}
	defer rows.Close()

	for rows.Next() {
		var termId int
		var startDate, endDate string
		err = rows.Scan(&termId, &startDate, &endDate)
    if err != nil {
      return terms, err
    }
    terms = append(
      terms,
      Term{TermId: termId, StartDate: startDate, EndDate: endDate},
    )
	}

  return terms, nil
}
