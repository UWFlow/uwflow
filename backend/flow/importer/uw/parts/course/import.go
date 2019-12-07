package course

import (
	"fmt"

	"flow/common/state"
	"flow/importer/uw/api"
	"flow/importer/uw/log"
)

func ImportAll(state *state.State, client *api.Client) error {
	var converted ConvertResult
	log.StartImport(state.Log, "course")

	courses, err := FetchAll(client)
	if err != nil {
		return fmt.Errorf("failed to fetch courses: %w", err)
	}

	err = ConvertAll(&converted, courses)
	if err != nil {
		return fmt.Errorf("failed to convert courses: %w", err)
	}

	err = InsertAllCourses(state.Db, converted.Courses)
	if err != nil {
		return fmt.Errorf("failed to insert courses: %w", err)
	}

	err = InsertAllPrereqs(state.Db, converted.Prereqs)
	if err != nil {
		return fmt.Errorf("failed to insert requisites: %w", err)
	}

	return nil
}
