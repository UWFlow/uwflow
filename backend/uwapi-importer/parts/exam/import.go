package exam

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/state"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/util"
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
	json.NewEncoder(os.Stdout).Encode(exams)

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
