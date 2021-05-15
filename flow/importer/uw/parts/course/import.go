package course

import (
	"fmt"

	"flow/common/state"
	"flow/common/util"
	"flow/importer/uw/api"
	"flow/importer/uw/log"
	"flow/importer/uw/parts/term"
)

func ImportAll(state *state.State, client *api.Client) error {
	var converted convertResult
	idToTerm := make(map[int]*term.Term)

	// Fetch for previous two, current, and next terms
	termIds := []int{
		util.PreviousTermId(2), util.PreviousTermId(1),
		util.CurrentTermId(), util.NextTermId(),
	}
	for _, termId := range termIds {
		term, err := term.Select(state.Db, termId)
		if err != nil {
			log.Warnf("no record for term %04d, proceeding anyway", termId)
		}
		idToTerm[termId] = term
	}

	courses, classes, err := fetchAll(client, termIds)
	if err != nil {
		return fmt.Errorf("failed to fetch courses: %w", err)
	}

	err = convertAll(&converted, courses, classes, idToTerm)
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

	log.StartImport("prof")
	result, err = insertAllProfs(state.Db, converted.Profs)
	if err != nil {
		return fmt.Errorf("failed to insert profs: %w", err)
	}
	log.EndImport("prof", result)

	log.StartImport("course_section")
	result, err = insertAllSections(state.Db, converted.Sections)
	if err != nil {
		return fmt.Errorf("failed to insert sections: %w", err)
	}
	log.EndImport("course_section", result)

	log.StartImport("section_meeting")
	result, err = insertAllMeetings(state.Db, converted.Meetings)
	if err != nil {
		return fmt.Errorf("failed to insert meetings: %w", err)
	}
	log.EndImport("section_meeting", result)

	return nil
}
