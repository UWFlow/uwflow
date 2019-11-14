package term

import (
	"fmt"

	"flow/common/state"
	"flow/worker/importer/uw/api"
	"flow/worker/importer/uw/log"
)

func ImportAll(state *state.State, client *api.Client) error {
	log.StartImport(state.Log, "term")

	events, err := FetchAll(client)
	if err != nil {
		return fmt.Errorf("failed to fetch terms: %w", err)
	}

	terms, err := ConvertAll(events)
	if err != nil {
		return fmt.Errorf("failed to convert terms: %w", err)
	}

	result, err := InsertAll(state.Ctx, state.Db, terms)
	if err != nil {
		return fmt.Errorf("failed to insert terms: %w", err)
	}

	log.EndImport(state.Log, "term", result)
	return nil
}
