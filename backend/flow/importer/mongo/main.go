package main

import (
	"context"
	"log"

	"flow/common/state"
	"flow/importer/mongo/parts"
)

type ImportFunction func(*state.State, *parts.IdentifierMap) error

func main() {
	ctx := context.Background()
	state, err := state.New(ctx)
	if err != nil {
		log.Fatalf("Initialization failed: %v", err)
	}

	idMap := &parts.IdentifierMap{}
	operations := []ImportFunction{
		parts.ImportCourses,
		parts.ImportCourseRequisites,
		parts.ImportProfs,
		parts.ImportSections,
		parts.ImportUsers,
		parts.ImportReviews,
		parts.ImportSchedules,
	}
	for _, operation := range operations {
		err = operation(state, idMap)
		if err != nil {
			log.Fatalf("Import failed: %v", err)
		}
	}
}
