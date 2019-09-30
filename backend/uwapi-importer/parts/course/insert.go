package course

import "github.com/AyushK1/uwflow2.0/backend/uwapi-importer/db"

const InsertQuery = `
INSERT INTO course(code, name, description, prereqs, coreqs, antireqs)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (code) DO NOTHING
`

func Insert(conn *db.Conn, course *Course) error {
	_, err := conn.Exec(
		InsertQuery,
		course.Code, course.Name, course.Description,
		course.Prereqs, course.Coreqs, course.Antireqs,
	)
	return err
}
