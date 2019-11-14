package log

import (
	"flow/worker/importer/uw/db"

	"go.uber.org/zap"
)

type Logger struct {
	// Export this: callers should be able to log one-off messages directly
	Zap *zap.Logger
}

func New() (*Logger, error) {
	// Skip immediate caller: our logging statements are all wrapped
	zap, err := zap.NewProduction(zap.AddCallerSkip(1))
	if err != nil {
		return nil, err
	}
	return &Logger{Zap: zap}, nil
}

func (log *Logger) ApiBug(description string, cause string) {
	log.Zap.Warn(
		"api bug",
		zap.String("description", description),
		zap.String("cause", cause),
	)
}

func (log *Logger) StartImport(kind string) {
	log.Zap.Info("start import", zap.String("kind", kind))
}

func (log *Logger) EndImport(kind string, result *db.Result) {
	log.Zap.Info(
		"end import",
		zap.String("kind", kind),
		zap.Int("inserted", result.Inserted),
		zap.Int("updated", result.Updated),
		zap.Int("untouched", result.Untouched),
		zap.Int("rejected", result.Rejected),
	)
}

func (log *Logger) StartTermImport(kind string, termId int) {
	log.Zap.Info(
		"start import",
		zap.String("kind", kind),
		zap.Int("term", termId),
	)
}

func (log *Logger) EndTermImport(kind string, termId int, result *db.Result) {
	log.Zap.Info(
		"end import",
		zap.String("kind", kind),
		zap.Int("term", termId),
		zap.Int("inserted", result.Inserted),
		zap.Int("updated", result.Updated),
		zap.Int("untouched", result.Untouched),
		zap.Int("rejected", result.Rejected),
	)
}

func (log *Logger) StartVacuum(kind string) {
	log.Zap.Info(
		"start vacuum",
		zap.String("kind", kind),
	)
}

func (log *Logger) EndVacuum(kind string, deleted int) {
	log.Zap.Info(
		"end vacuum",
		zap.String("kind", kind),
		zap.Int("deleted", deleted),
	)
}
