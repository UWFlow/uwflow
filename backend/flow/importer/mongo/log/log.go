package log

import (
	"log"

	"github.com/jackc/pgconn"
	"go.uber.org/zap"
)

func Error(err error) {
	if pgErr, ok := err.(*pgconn.PgError); ok {
		log.Fatalf(
			"Error: %s Detail: %s Where: %s",
			pgErr.Message, pgErr.Detail, pgErr.Where,
		)
	}

	log.Fatalf("Error: %s", err.Error())
}

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
