package log

import "go.uber.org/zap"

func StartImport(log *zap.Logger, table string) {
	log.Info("start import", zap.String("table", table))
}

func EndImport(log *zap.Logger, table string, count int64) {
	log.Info(
		"end import",
		zap.String("table", table),
		zap.Int64("count", count),
	)
}
