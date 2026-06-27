package main

import (
	"context"
	"log"
	"os"
	"time"
	_ "time/tzdata"

	"github.com/getsentry/sentry-go"

	"flow/common/state"
	"flow/importer/uw/api"
	"flow/importer/uw/parts/course"
	"flow/importer/uw/parts/term"
)

type ImportFunc func(*state.State, *api.Client) error
type VacuumFunc func(*state.State) error

// RunImport runs each importer, capturing any failures to Sentry. It returns
// false if any importer failed, so the caller can mark a cron check-in failed.
func RunImport(state *state.State, client *api.Client, importers ...ImportFunc) bool {
	ok := true
	for _, importer := range importers {
		err := importer(state, client)
		if err != nil {
			sentry.CaptureException(err)
			log.Printf("API import failed: %v\n", err)
			ok = false
		}
	}
	return ok
}

// RunVacuum runs each vacuum, capturing any failures to Sentry. It returns
// false if any vacuum failed, so the caller can mark a cron check-in failed.
func RunVacuum(state *state.State, vacuums ...VacuumFunc) bool {
	ok := true
	for _, vacuum := range vacuums {
		err := vacuum(state)
		if err != nil {
			sentry.CaptureException(err)
			log.Printf("Vacuum failed: %v\n", err)
			ok = false
		}
	}
	return ok
}

var HourlyFuncs = []ImportFunc{term.ImportAll, course.ImportAll}
var VacuumFuncs = []VacuumFunc{term.Vacuum, course.Vacuum}

// monitorSpec describes the Sentry Cron Monitor for a scheduled action.
type monitorSpec struct {
	// schedule is the crontab expression, mirroring crontab.
	schedule string
	// maxRuntime is how long (in minutes) the job may run before Sentry
	// considers it stuck. Tune if a run legitimately takes longer.
	maxRuntime int64
}

// monitorSchedules maps each scheduled action to its monitor config. Only
// actions listed here report to Sentry Crons; manual runs ("courses",
// "terms") are intentionally omitted.
var monitorSchedules = map[string]monitorSpec{
	"hourly": {schedule: "20 6 * * *", maxRuntime: 360},
	"vacuum": {schedule: "30 5 * * *", maxRuntime: 30},
}

// checkInMargin is the grace period (in minutes) for the start check-in before
// Sentry reports the run as missed.
const checkInMargin = 30

// withMonitor wraps a scheduled job with Sentry Cron check-ins: an in-progress
// check-in before, and an OK/error check-in after based on run's result. If the
// action has no schedule or Sentry is disabled, run executes without reporting.
func withMonitor(action string, run func() bool) {
	spec, monitored := monitorSchedules[action]
	if !monitored || sentry.CurrentHub().Client() == nil {
		run()
		return
	}

	slug := "uwflow-importer-" + action
	config := &sentry.MonitorConfig{
		Schedule:      sentry.CrontabSchedule(spec.schedule),
		MaxRuntime:    spec.maxRuntime,
		CheckInMargin: checkInMargin,
		Timezone:      "UTC",
	}

	checkInID := sentry.CaptureCheckIn(&sentry.CheckIn{
		MonitorSlug: slug,
		Status:      sentry.CheckInStatusInProgress,
	}, config)

	status := sentry.CheckInStatusOK
	if !run() {
		status = sentry.CheckInStatusError
	}

	checkIn := &sentry.CheckIn{MonitorSlug: slug, Status: status}
	if checkInID != nil {
		checkIn.ID = *checkInID
	}
	sentry.CaptureCheckIn(checkIn, config)
}

func main() {
	if len(os.Args) != 2 {
		log.Fatalf("Usage: %s ACTION", os.Args[0])
	}

	if dsn := os.Getenv("SENTRY_DSN"); dsn != "" {
		err := sentry.Init(sentry.ClientOptions{
			Dsn:         dsn,
			Environment: os.Getenv("RUN_MODE"),
		})
		if err != nil {
			log.Printf("sentry.Init: %s", err)
		}
		defer sentry.Flush(2 * time.Second)
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
		RunImport(state, client, course.ImportAll)
	case "hourly":
		withMonitor("hourly", func() bool {
			return RunImport(state, client, HourlyFuncs...)
		})
	case "terms":
		RunImport(state, client, term.ImportAll)
	case "vacuum":
		withMonitor("vacuum", func() bool {
			return RunVacuum(state, VacuumFuncs...)
		})
	default:
		log.Fatalf("Not an action: %s", os.Args[1])
	}
}
