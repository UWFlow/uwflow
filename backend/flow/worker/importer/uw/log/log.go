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

func ApiBug(log *zap.Logger, description string, cause string) {
	log.Warn(
		"api bug",
		zap.String("description", description),
		zap.String("cause", cause),
	)
}

func StartImport(log *zap.Logger, kind string) {
	log.Info("start import", zap.String("kind", kind))
}

func EndImport(log *zap.Logger, kind string, result *DbResult) {
	log.Info(
		"end import",
		zap.String("kind", kind),
		zap.Int("inserted", result.Inserted),
		zap.Int("updated", result.Updated),
		zap.Int("untouched", result.Untouched),
		zap.Int("rejected", result.Rejected),
	)
}

func StartTermImport(log *zap.Logger, kind string, termId int) {
	log.Info(
		"start import",
		zap.String("kind", kind),
		zap.Int("term", termId),
	)
}

func EndTermImport(log *zap.Logger, kind string, termId int, result *DbResult) {
	log.Info(
		"end import",
		zap.String("kind", kind),
		zap.Int("term", termId),
		zap.Int("inserted", result.Inserted),
		zap.Int("updated", result.Updated),
		zap.Int("untouched", result.Untouched),
		zap.Int("rejected", result.Rejected),
	)
}

func StartVacuum(log *zap.Logger, kind string) {
	log.Info(
		"start vacuum",
		zap.String("kind", kind),
	)
}

func EndVacuum(log *zap.Logger, kind string, deleted int) {
	log.Info(
		"end vacuum",
		zap.String("kind", kind),
		zap.Int("deleted", deleted),
	)
}
