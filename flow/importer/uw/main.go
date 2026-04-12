package main

import (
	"context"
	"log"
	"os"
	_ "time/tzdata"

	"flow/common/state"
	"flow/importer/uw/api"
	"flow/importer/uw/parts/course"
	"flow/importer/uw/parts/term"
)

type ImportFunc func(*state.State, *api.Client) error
type VacuumFunc func(*state.State) error

func RunImport(state *state.State, client *api.Client, importers ...ImportFunc) error {
	for _, importer := range importers {
		err := importer(state, client)
		if err != nil {
			return err
		}
	}

	return nil
}

func RunVacuum(state *state.State, vacuums ...VacuumFunc) error {
	for _, vacuum := range vacuums {
		err := vacuum(state)
		if err != nil {
			return err
		}
	}

	return nil
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
		err = RunImport(state, client, course.ImportAll)
	case "hourly":
		err = RunImport(state, client, HourlyFuncs...)
	case "terms":
		err = RunImport(state, client, term.ImportAll)
	case "vacuum":
		err = RunVacuum(state, VacuumFuncs...)
	default:
		log.Fatalf("Not an action: %s", os.Args[1])
	}

	if err != nil {
		log.Fatalf("UW importer failed: %v\n", err)
	}
}
