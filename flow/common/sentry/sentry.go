package sentry

import (
	"flow/api/env"
	"log"

	"github.com/getsentry/sentry-go"
)

func InitSentry(sampleRate float64, traceSampleRate float64) error {

	// If SentryDsn is not set, we'll skip Sentry initialization
	if env.Global.SentryDsn == "" {
		log.Println("Sentry DSN not provided, skipping Sentry initialization")
		return nil
	}
	
	debug := env.Global.RunMode == "dev"
	environment := env.Global.RunMode

	// Set sample rates to 1 in dev mode, otherwise use provided values
	if debug {
		sampleRate = 1.0
		traceSampleRate = 1.0
	} 

	return sentry.Init(sentry.ClientOptions{
		Dsn: env.Global.SentryDsn,

		// Enable printing of SDK debug messages.
		// Useful when getting started or trying to figure something out.
		
		EnableTracing: true,
		Debug: debug,

		Environment: environment,

		// Sample rate for errors
		SampleRate: sampleRate,

		// Sample rate for traces
		TracesSampleRate: traceSampleRate,

		// Attach stacktrace to events
		AttachStacktrace: true,

	})
}
