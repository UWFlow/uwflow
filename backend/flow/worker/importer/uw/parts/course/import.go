package course

import (
	"fmt"

	"flow/worker/importer/uw/state"
)

func ImportAll(state *state.State) error {
	state.Log.StartImport("course")

	courses, err := FetchAll(state.Api)
	if err != nil {
		return fmt.Errorf("failed to fetch courses: %w", err)
	}

	result, err := InsertAll(state.Db, courses)
	if err != nil {
		return fmt.Errorf("failed to insert courses: %w", err)
	}

	state.Log.EndImport("course", result)
	return nil
}
