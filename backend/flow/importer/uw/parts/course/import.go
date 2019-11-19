package course

import (
	"fmt"

	"flow/common/state"
	"flow/importer/uw/api"
	"flow/importer/uw/log"
)

func ImportAll(state *state.State, client *api.Client) error {
	log.StartImport(state.Log, "course")

	courses, err := FetchAll(client)
	if err != nil {
		return fmt.Errorf("failed to fetch courses: %w", err)
	}

	result, err := InsertAll(state.Db, courses)
	if err != nil {
		return fmt.Errorf("failed to insert courses: %w", err)
	}

	log.EndImport(state.Log, "course", result)
	return nil
}
