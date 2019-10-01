package exam

import (
	"fmt"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/db"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/util"
)

const DeleteQuery = `DELETE FROM course_exam WHERE term < $1`

func Vacuum(conn *db.Conn) error {
	// Retain only exams starting with the previous term
	_, err := conn.Exec(DeleteQuery, util.PreviousTermId())
	if err != nil {
		return fmt.Errorf("database write failed: %w", err)
	}
	return nil
}
