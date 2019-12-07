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
	var converted ConvertResult
	termIds := []int{util.CurrentTermId(), util.NextTermId()}

	for _, termId := range termIds {
		apiSections, err := FetchByTerm(client, termId)
		if err != nil {
			return fmt.Errorf("failed to fetch sections: %w", err)
		}

		term, err := term.Select(state.Db, termId)
		if err != nil {
			return fmt.Errorf("failed to load term: %w", err)
		}

		err = ConvertAll(&converted, apiSections, term)
		if err != nil {
			return fmt.Errorf("failed to convert sections: %w", err)
		}
	}

	log.StartImport(state.Log, "prof")
	result, err := InsertAllProfs(state.Db, converted.Profs)
	if err != nil {
		return fmt.Errorf("failed to insert profs: %w", err)
	}
	log.EndImport(state.Log, "prof", result)

	log.StartImport(state.Log, "course_section")
	result, err = InsertAllSections(state.Db, converted.Sections)
	if err != nil {
		return fmt.Errorf("failed to insert sections: %w", err)
	}
	log.EndImport(state.Log, "course_section", result)

	log.StartImport(state.Log, "section_meeting")
	result, err = InsertAllMeetings(state.Db, converted.Meetings)
	if err != nil {
		return fmt.Errorf("failed to insert meetings: %w", err)
	}
	log.EndImport(state.Log, "section_meeting", result)

	log.StartImport(state.Log, "update_time")
	result, err = InsertAllUpdateTimes(state.Db, converted.UpdateTimes)
	if err != nil {
		return fmt.Errorf("failed to update times: %w", err)
	}
	log.EndImport(state.Log, "update_time", result)

	return nil
}
