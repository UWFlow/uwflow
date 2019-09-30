package section

import (
	"fmt"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/parts/term"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/state"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/util"
)

func ImportByTermSubject(state *state.State, term *term.Term, subject string) error {
	apiSections, err := FetchByTermSubject(state.Api, term.TermId, subject)
	if err != nil {
		return fmt.Errorf("failed to fetch sections: %w", err)
	}

	for _, apiSection := range apiSections {
		section := ConvertSection(&apiSection)
		err := InsertSection(state.Db, section)
		if err != nil {
			state.Log.Zap.Error("Failed to insert section: " + err.Error())
		}
		for _, apiMeeting := range apiSection.Meetings {
			meeting, err := ConvertMeeting(&apiMeeting, section, term)
			if err != nil {
				state.Log.Zap.Error("Failed to convert meeting: " + err.Error())
			}
			err = InsertMeeting(state.Db, meeting)
			if err != nil {
				state.Log.Zap.Error("Failed to insert meeting: " + err.Error())
			}
		}
	}

	return nil
}

func ImportAll(state *state.State) error {
	currentTermId := util.CurrentTermId()
	terms, err := term.SelectAll(state.Db)
	if err != nil {
		return fmt.Errorf("failed to load terms: %w", err)
	}
	//subjects, err := subject.SelectAll(state.Db)
	//if err != nil {
	//  return fmt.Errorf("failed to load subjects: %w", err)
	//}

	for _, term := range terms {
		// Don't bother with terms that have passed
		if term.TermId < currentTermId {
			continue
		}
		err := ImportByTermSubject(state, &term, "cs")
		if err != nil {
			return err
		}
	}
	return nil
}
