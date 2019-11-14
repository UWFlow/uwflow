package main

import (
	"context"
	"log"
	"os"

	"flow/common/state"
	"flow/worker/importer/uw/api"
	"flow/worker/importer/uw/parts/course"
	"flow/worker/importer/uw/parts/exam"
	"flow/worker/importer/uw/parts/section"
	"flow/worker/importer/uw/parts/term"
)

type ImportFunc func(*state.State, *api.Client) error
type VacuumFunc func(*state.State) error

func RunImport(state *state.State, client *api.Client, importers ...ImportFunc) {
	for _, importer := range importers {
		err := importer(state, client)
		if err != nil {
			log.Fatalf("API import failed: %v\n", err)
		}
	}
}

func RunVacuum(state *state.State, vacuums ...VacuumFunc) {
	for _, vacuum := range vacuums {
		err := vacuum(state)
		if err != nil {
			log.Fatalf("Vacuum failed: %v\n", err)
		}
	}
}

var DailyFuncs = []ImportFunc{
	term.ImportAll, course.ImportAll, section.ImportAll, exam.ImportAll,
}
var HourlyFuncs = []ImportFunc{section.ImportAll}
var VacuumFuncs = []VacuumFunc{term.Vacuum, course.Vacuum, section.Vacuum, exam.Vacuum}

func main() {
	if len(os.Args) != 2 {
		log.Fatalf("Usage: %s ACTION", os.Args[0])
	}

	// TODO: set sane time limit?
	ctx := context.Background()
	state, err := state.New(ctx)
	if err != nil {
		log.Fatalf("Initialization failed: %v\n", err)
	}
	client := api.NewClient(ctx, state.Env, state.Log)

	switch os.Args[1] {
	case "courses":
		RunImport(state, client, course.ImportAll)
	case "daily":
		RunImport(state, client, DailyFuncs...)
	case "exams":
		RunImport(state, client, exam.ImportAll)
	case "hourly":
		RunImport(state, client, HourlyFuncs...)
	case "sections":
		RunImport(state, client, section.ImportAll)
	case "terms":
		RunImport(state, client, term.ImportAll)
	case "vacuum":
		RunVacuum(state, VacuumFuncs...)
	default:
		log.Fatalf("Not an action: %s", os.Args[1])
	}
}
