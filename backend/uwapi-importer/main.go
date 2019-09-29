package main

import (
	"context"
	"log"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/parts"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/state"
)

func main() {
	// TODO: set sane time limit?
	ctx := context.Background()
	state, err := state.New(ctx)
	if err != nil {
		log.Fatalf("Initialization failed: %v\n", err)
	}
	err = parts.ImportantDates(state)
	if err != nil {
		log.Fatalf("UW API import failed: %v\n", err)
	}
}
