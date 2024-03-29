package term

import "flow/common/db"

const selectQuery = `SELECT id, start_date, end_date FROM term WHERE id = $1`

func Select(conn *db.Conn, termId int) (*Term, error) {
	var term Term
	err := conn.QueryRow(selectQuery, termId).Scan(&term.Id, &term.StartDate, &term.EndDate)
	return &term, err
}
