package parts

import "github.com/jackc/pgx"

func PostImport(db *pgx.Conn, rootPath string, idMap *IdentifierMap) error {
	_, err := db.Exec(`REFRESH MATERIALIZED VIEW CONCURRENTLY materialized.prof_course`)
	return err
}
