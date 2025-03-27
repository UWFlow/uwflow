package main

import (
	"context"
	"log"
	"os"
	"time"
	_ "time/tzdata"

	"flow/common/state"
	"flow/importer/uw/api"
	"flow/importer/uw/parts/course"
	"flow/importer/uw/parts/term"

	sentry_client "flow/common/sentry"

	"github.com/getsentry/sentry-go"
)

type ImportFunc func(*state.State, *api.Client) error
type VacuumFunc func(*state.State) error

// Define monitor slugs for each task type
const (
	MonitorSlugCourses = "uw-importer-courses"
	MonitorSlugHourly  = "uw-importer-hourly"
	MonitorSlugTerms   = "uw-importer-terms"
	MonitorSlugVacuum  = "uw-importer-vacuum"
)

func RunImport(state *state.State, client *api.Client, importers ...ImportFunc) {
	for _, importer := range importers {
		err := importer(state, client)
		if err != nil {
			log.Printf("API import failed: %v\n", err)
		}
	}
}

func RunVacuum(state *state.State, vacuums ...VacuumFunc) {
	for _, vacuum := range vacuums {
		err := vacuum(state)
		if err != nil {
			log.Printf("Vacuum failed: %v\n", err)
		}
	}
}

// Wrap import function to include Sentry monitoring
func monitoredImport(monitorSlug string, state *state.State, client *api.Client, importers ...ImportFunc) {
	checkinId := sentry.CaptureCheckIn(
		&sentry.CheckIn{
			MonitorSlug: monitorSlug,
			Status:      sentry.CheckInStatusInProgress,
		},
		&sentry.MonitorConfig{
			Schedule:      sentry.CrontabSchedule("20 */2 * * * "),
			MaxRuntime:    30, // 30 minute timeout
			CheckInMargin: 5,  // 5 minute margin
		},
	)

	success := true
	for _, importer := range importers {
		err := importer(state, client)
		if err != nil {
			success = false
			log.Printf("API import failed: %v\n", err)
			sentry.CaptureException(err)
		}
	}

	status := sentry.CheckInStatusOK
	if !success {
		status = sentry.CheckInStatusError
	}

	sentry.CaptureCheckIn(
		&sentry.CheckIn{
			ID:          *checkinId,
			MonitorSlug: monitorSlug,
			Status:      status,
		},
		nil,
	)
}

// Similar wrapper for vacuum operations
func monitoredVacuum(monitorSlug string, state *state.State, vacuums ...VacuumFunc) {
	checkinId := sentry.CaptureCheckIn(
		&sentry.CheckIn{
			MonitorSlug: monitorSlug,
			Status:      sentry.CheckInStatusInProgress,
		},
		&sentry.MonitorConfig{
			Schedule:      sentry.CrontabSchedule("30 05 * * *"), // Run daily
			MaxRuntime:    60, // 60 minute timeout
			CheckInMargin: 10, // 10 minute margin
		},
	)

	success := true
	for _, vacuum := range vacuums {
		err := vacuum(state)
		if err != nil {
			success = false
			log.Printf("Vacuum failed: %v\n", err)
			sentry.CaptureException(err)
		}
	}

	status := sentry.CheckInStatusOK
	if !success {
		status = sentry.CheckInStatusError
	}

	sentry.CaptureCheckIn(
		&sentry.CheckIn{
			ID:          *checkinId,
			MonitorSlug: monitorSlug,
			Status:      status,
		},
		nil,
	)
}

var HourlyFuncs = []ImportFunc{term.ImportAll, course.ImportAll}
var VacuumFuncs = []VacuumFunc{term.Vacuum, course.Vacuum}

func main() {

	// Initialize Sentry
	if err := sentry_client.InitSentry(1, 1); err != nil {
		log.Printf("Sentry initialization failed: %v", err)
	}
	defer sentry.Flush(2 * time.Second)

	if len(os.Args) != 2 {
		log.Fatalf("Usage: %s ACTION", os.Args[0])
	}

	// TODO: set sane time limit?
	ctx := context.Background()
	state, err := state.New(ctx, "uw")
	if err != nil {
		log.Fatalf("Initialization failed: %v\n", err)
	}
	client := api.NewClient(ctx, state.Env)

	switch os.Args[1] {
	case "courses":
		monitoredImport(MonitorSlugCourses, state, client, course.ImportAll)
	case "hourly":
		monitoredImport(MonitorSlugHourly, state, client, HourlyFuncs...)
	case "terms":
		monitoredImport(MonitorSlugTerms, state, client, term.ImportAll)
	case "vacuum":
		monitoredVacuum(MonitorSlugVacuum, state, VacuumFuncs...)
	default:
		log.Fatalf("Not an action: %s", os.Args[1])
	}
}
