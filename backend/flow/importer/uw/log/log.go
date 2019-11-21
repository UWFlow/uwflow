package log

import "go.uber.org/zap"

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

func StartImport(log *zap.Logger, table string) {
	log.Info(
		"start import",
		zap.String("table", table),
	)
}

func EndImport(log *zap.Logger, table string, result *DbResult) {
	log.Info(
		"end import",
		zap.String("table", table),
		zap.Int("inserted", result.Inserted),
		zap.Int("updated", result.Updated),
		zap.Int("untouched", result.Untouched),
		zap.Int("rejected", result.Rejected),
	)
}

func StartTermImport(log *zap.Logger, table string, termId int) {
	log.Info(
		"start term import",
		zap.String("table", table),
		zap.Int("term", termId),
	)
}

func EndTermImport(log *zap.Logger, table string, termId int, result *DbResult) {
	log.Info(
		"end term import",
		zap.String("table", table),
		zap.Int("term", termId),
		zap.Int("inserted", result.Inserted),
		zap.Int("updated", result.Updated),
		zap.Int("untouched", result.Untouched),
		zap.Int("rejected", result.Rejected),
	)
}

func StartVacuum(log *zap.Logger, table string) {
	log.Info(
		"start vacuum",
		zap.String("table", table),
	)
}

func EndVacuum(log *zap.Logger, table string, deleted int) {
	log.Info(
		"end vacuum",
		zap.String("table", table),
		zap.Int("deleted", deleted),
	)
}
