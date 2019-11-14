package exam

import (
	"fmt"

	"flow/worker/importer/uw/state"
	"flow/worker/importer/uw/util"
)

func ImportByTerm(state *state.State, termId int) error {
	state.Log.StartTermImport("exam", termId)
	apiExams, err := FetchByTerm(state.Api, termId)
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

	state.Log.EndTermImport("exam", termId, result)
	return nil
}

func ImportAll(state *state.State) error {
	return ImportByTerm(state, util.CurrentTermId())
}
