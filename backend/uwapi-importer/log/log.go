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

func (log *Logger) EndImport(kind string, succeeded, failed int) {
  log.Zap.Info(
    "end import",
    zap.String("kind", kind),
    zap.Int("succeeded", succeeded),
    zap.Int("failed", failed),
  )
}
