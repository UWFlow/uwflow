package course

import "github.com/AyushK1/uwflow2.0/backend/uwapi-importer/db"

func Vacuum(conn *db.Conn) error {
	// Never delete past courses
	return nil
}
