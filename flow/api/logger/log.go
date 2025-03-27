package logger

import (
	"log"

	"github.com/getsentry/sentry-go"
)

func ConfigureLoggers() {
	logFlags := log.Ldate | log.Ltime
	sentry.Logger.SetPrefix("[sentry sdk]   ")
	sentry.Logger.SetFlags(logFlags)
	log.SetPrefix("[http example] ")
	log.SetFlags(logFlags)
}
