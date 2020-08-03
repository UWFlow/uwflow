package course

import (
	"fmt"

	"flow/common/state"
	"flow/importer/uw/api"
	"flow/importer/uw/log"
)

func ImportAll(state *state.State, client *api.Client) error {
	var converted convertResult

	courses, err := fetchAll(client)
	if err != nil {
		return fmt.Errorf("failed to fetch courses: %w", err)
	}

	err = convertAll(&converted, courses)
	if err != nil {
		return fmt.Errorf("failed to convert courses: %w", err)
	}

	log.StartImport("course")
	result, err := insertAllCourses(state.Db, converted.Courses)
	if err != nil {
		return fmt.Errorf("failed to insert courses: %w", err)
	}
	log.EndImport("course", result)

	err = insertAllPrereqs(state.Db, converted.Prereqs)
	if err != nil {
		return fmt.Errorf("failed to insert prerequisites: %w", err)
	}

	err = insertAllAntireqs(state.Db, converted.Antireqs)
	if err != nil {
		return fmt.Errorf("failed to insert antirequisites: %w", err)
	}

	return nil
}
