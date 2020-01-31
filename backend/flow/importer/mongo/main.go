package main

import (
	"context"

	"flow/common/state"
	"flow/importer/mongo/log"
	"flow/importer/mongo/parts"
)

type ImportFunction func(*state.State, *parts.IdentifierMap) error

func main() {
	state, err := state.New(context.Background(), "mongo")
	if err != nil {
		log.Error(err)
	}

	idMap := &parts.IdentifierMap{}
	operations := []ImportFunction{
		parts.ImportCourses,
		parts.ImportCourseRequisites,
		parts.ImportProfRenames,
		parts.ImportProfs,
		parts.ImportSections,
		parts.ImportUsers,
		parts.ImportReviews,
		parts.ImportLegacyReviews,
		parts.ImportSchedules,
	}
	for _, operation := range operations {
		err = operation(state, idMap)
		if err != nil {
			log.Error(err)
		}
	}
}
