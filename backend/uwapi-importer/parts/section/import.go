package section

import (
	"fmt"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/parts/term"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/state"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/util"
)

func ImportByTerm(state *state.State, term *term.Term) error {
	apiSections, err := FetchByTerm(state.Api, term.Id)
	if err != nil {
		return fmt.Errorf("failed to fetch sections: %w", err)
	}

	sections, meetings, profs, err := ConvertAll(apiSections, term)
	if err != nil {
		return fmt.Errorf("failed to convert sections: %w", err)
	}

	state.Log.StartTermImport("prof", term.Id)
  result, err := InsertAllProfs(state.Db, profs)
	if err != nil {
		return fmt.Errorf("failed to insert profs: %w", err)
	}
	state.Log.EndTermImport("prof", term.Id, result)

	state.Log.StartTermImport("section", term.Id)
	result, err = InsertAllSections(state.Db, sections)
	if err != nil {
		return fmt.Errorf("failed to insert sections: %w", err)
	}
	state.Log.EndTermImport("section", term.Id, result)

	state.Log.StartTermImport("meeting", term.Id)
  result, err = InsertAllMeetings(state.Db, meetings)
	if err != nil {
		return fmt.Errorf("failed to insert meetings: %w", err)
	}
	state.Log.EndTermImport("meeting", term.Id, result)

	return nil
}

func ImportAll(state *state.State) error {
	currentTermId := util.CurrentTermId()
	nextTermId := util.NextTermId()
	terms, err := term.SelectAll(state.Db)
	if err != nil {
		return fmt.Errorf("failed to load terms: %w", err)
	}

	for _, term := range terms {
		// Don't bother with terms that have passed
		if term.Id >= currentTermId && term.Id <= nextTermId {
			err := ImportByTerm(state, &term)
			if err != nil {
				return fmt.Errorf("failed to import sections: %w", err)
			}
		}
	}
	return nil
}
