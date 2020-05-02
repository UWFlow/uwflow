package exam

import (
	"fmt"

	"flow/common/state"
	"flow/common/util"
	"flow/importer/uw/api"
	"flow/importer/uw/log"
)

func ImportByTerm(state *state.State, client *api.Client, termId int) error {
	log.StartTermImport("section_exam", termId)

	apiExams, err := FetchByTerm(client, termId)
	if err != nil {
		return fmt.Errorf("failed to fetch exams: %w", err)
	}

	exams, err := ConvertByTerm(apiExams, termId)
	if err != nil {
		return fmt.Errorf("failed to convert exams: %w", err)
	}

	result, err := InsertAll(state.Db, exams)
	if err != nil {
		return fmt.Errorf("failed to insert exams: %w", err)
	}

	log.EndTermImport("section_exam", termId, result)
	return nil
}

func ImportAll(state *state.State, client *api.Client) error {
	return ImportByTerm(state, client, util.CurrentTermId())
}
