package section

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
	termIds := []int{util.PreviousTermId(), util.CurrentTermId(), util.NextTermId()}

	for _, termId := range termIds {
		apiSections, err := fetchByTerm(client, termId)
		if err != nil {
			log.Warnf("failed to fetch sections for %04d, proceeding anyway", termId)
			continue
		}

		term, err := term.Select(state.Db, termId)
		if err != nil {
			log.Warnf("no record for term %04d, proceeding anyway", termId)
			continue
		}

		err = convertAll(&converted, apiSections, term)
		if err != nil {
			log.Warnf("failed to convert sections for %04d, proceeding anyway", termId)
			continue
		}
	}

	log.StartImport("prof")
	result, err := insertAllProfs(state.Db, converted.Profs)
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
