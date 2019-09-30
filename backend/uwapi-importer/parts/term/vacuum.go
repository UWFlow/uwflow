package term

import (
  "fmt"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/db"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/util"
)

const DeleteQuery = `DELETE FROM term_date WHERE term < $1`

func Vacuum(conn *db.Conn) error {
	// Retain only terms starting with the previous one
	_, err := conn.Exec(DeleteQuery, util.PreviousTermId())
	if err != nil {
		return fmt.Errorf("database write failed: %w", err)
	}
  return nil
}
