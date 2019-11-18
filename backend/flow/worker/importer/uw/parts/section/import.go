package section

import (
	"fmt"

	"flow/common/state"
	"flow/common/util"
	"flow/worker/importer/uw/api"
	"flow/worker/importer/uw/log"
	"flow/worker/importer/uw/parts/term"
)

func ImportByTerm(state *state.State, client *api.Client, term *term.Term) error {
	apiSections, err := FetchByTerm(client, term.Id)
	if err != nil {
		return fmt.Errorf("failed to fetch sections: %w", err)
	}

	var converted ConvertResult
	err = ConvertAll(&converted, apiSections, term)
	if err != nil {
		return fmt.Errorf("failed to convert sections: %w", err)
	}

	log.StartTermImport(state.Log, "prof", term.Id)
	result, err := InsertAllProfs(state.Db, converted.Profs)
	if err != nil {
		return fmt.Errorf("failed to insert profs: %w", err)
	}
	log.EndTermImport(state.Log, "prof", term.Id, result)

	log.StartTermImport(state.Log, "section", term.Id)
	result, err = InsertAllSections(state.Db, converted.Sections)
	if err != nil {
		return fmt.Errorf("failed to insert sections: %w", err)
	}
	log.EndTermImport(state.Log, "section", term.Id, result)

	log.StartTermImport(state.Log, "meeting", term.Id)
	result, err = InsertAllMeetings(state.Db, converted.Meetings)
	if err != nil {
		return fmt.Errorf("failed to insert meetings: %w", err)
	}
	log.EndTermImport(state.Log, "meeting", term.Id, result)

	return nil
}

func ImportAll(state *state.State, client *api.Client) error {
	currentTermId := util.CurrentTermId()
	nextTermId := util.NextTermId()
	terms, err := term.SelectAll(state.Db)
	if err != nil {
		return fmt.Errorf("failed to load terms: %w", err)
	}

	for _, term := range terms {
		// Don't bother with terms that have passed
		if term.Id >= currentTermId && term.Id <= nextTermId {
			err := ImportByTerm(state, client, &term)
			if err != nil {
				return fmt.Errorf("failed to import sections: %w", err)
			}
		}
	}
	return nil
}
