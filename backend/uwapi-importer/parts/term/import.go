package term

import (
	"fmt"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/state"
)

func ImportAll(state *state.State) error {
	state.Log.StartImport("term")

	events, err := FetchAll(state.Api)
	if err != nil {
		return fmt.Errorf("failed to fetch terms: %w", err)
	}

	terms, err := ConvertAll(events)
	if err != nil {
		return fmt.Errorf("failed to convert terms: %w", err)
	}

	result, err := InsertAll(state.Db, terms)
	if err != nil {
		return fmt.Errorf("failed to insert terms: %w", err)
	}

	state.Log.EndImport("term", result)
	return nil
}
