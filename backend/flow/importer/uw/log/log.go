package log

import "log"

// Result of a database operation.
type DbResult struct {
	// Rows that were first added to the database during this operation.
	Inserted int
	// Rows that were present and got updated.
	Updated int
	// Rows that were present and did not merit an update.
	Untouched int
	// Rows that were found inadmissible:
	// broken invariants, missing join dependencies etc.
	Rejected int
}

func StartImport(table string) {
	log.Printf("start import to %s", table)
}

func EndImport(table string, result *DbResult) {
	log.Printf(
		"end import to %s: %d inserted, %d updated, %d untouched, %d rejected",
		table, result.Inserted, result.Updated, result.Untouched, result.Rejected,
	)
}

func StartTermImport(table string, termId int) {
	log.Printf("start import to %s for %04d", table, termId)
}

func EndTermImport(table string, termId int, result *DbResult) {
	log.Printf(
		"end import to %s for %04d: %d inserted, %d updated, %d untouched, %d rejected",
		table, termId, result.Inserted, result.Updated, result.Untouched, result.Rejected,
	)
}

func StartVacuum(table string) {
	log.Printf("start vacuum of %s", table)
}

func EndVacuum(table string, deleted int) {
	log.Printf("end vacuum of %s: %d deleted", table, deleted)
}
