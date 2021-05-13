package main

import (
	"context"
	"log"
	"os"

	"flow/common/state"
	"flow/importer/uw/api"
	"flow/importer/uw/parts/course"
	"flow/importer/uw/parts/term"
)

type ImportFunc func(*state.State, *api.Client) error
type VacuumFunc func(*state.State) error

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

var HourlyFuncs = []ImportFunc{term.ImportAll, course.ImportAll}
var VacuumFuncs = []VacuumFunc{term.Vacuum, course.Vacuum}

func main() {
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
		RunImport(state, client, course.ImportAll)
	case "hourly":
		RunImport(state, client, HourlyFuncs...)
	case "terms":
		RunImport(state, client, term.ImportAll)
	case "vacuum":
		RunVacuum(state, VacuumFuncs...)
	default:
		log.Fatalf("Not an action: %s", os.Args[1])
	}
}
