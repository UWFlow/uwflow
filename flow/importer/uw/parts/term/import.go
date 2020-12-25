package term

import (
	"fmt"

	"flow/common/state"
	"flow/importer/uw/api"
	"flow/importer/uw/log"
)

func ImportAll(state *state.State, client *api.Client) error {
	log.StartImport("term")

	events, err := fetchAll(client)
	if err != nil {
		return fmt.Errorf("failed to fetch terms: %w", err)
	}

	terms, err := convertAll(events)
	if err != nil {
		return fmt.Errorf("failed to convert terms: %w", err)
	}

	result, err := insertAll(state.Db, terms)
	if err != nil {
		return fmt.Errorf("failed to insert terms: %w", err)
	}

	log.EndImport("term", result)
	return nil
}
