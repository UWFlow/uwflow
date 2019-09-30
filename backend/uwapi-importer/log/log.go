package log

import "go.uber.org/zap"

type Logger struct {
	// Export this: callers should have the liberty log one-off messages directly
	Zap *zap.Logger
}

func New() (*Logger, error) {
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

func (log *Logger) EndImport(kind string, inserted, updated, rejected int) {
	log.Zap.Info(
		"end import",
		zap.String("kind", kind),
		zap.Int("inserted", inserted),
		zap.Int("updated", updated),
		zap.Int("rejected", rejected),
	)
}

func (log *Logger) StartTermImport(kind string, termId int) {
	log.Zap.Info(
		"start import",
		zap.String("kind", kind),
		zap.Int("term", termId),
	)
}

func (log *Logger) EndTermImport(kind string, termId, inserted, updated, rejected int) {
	log.Zap.Info(
		"end import",
		zap.String("kind", kind),
		zap.Int("term", termId),
		zap.Int("inserted", inserted),
		zap.Int("updated", updated),
		zap.Int("rejected", rejected),
	)
}
