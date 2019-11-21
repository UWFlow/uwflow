package term

import (
	"time"

	"flow/common/db"
)

const SelectQuery = `SELECT term, start_date, end_date FROM term_date`

func SelectAll(conn *db.Conn) ([]Term, error) {
	var terms []Term

	rows, err := conn.Query(SelectQuery)
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
