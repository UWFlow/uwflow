package exam

import (
	"fmt"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/state"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/util"
)

func ImportByTerm(state *state.State, termId int) error {
	apiExams, err := FetchByTerm(state.Api, termId)
	if err != nil {
		return fmt.Errorf("failed to fetch exams: %w", err)
	}

	var exams []Exam
	for _, apiExam := range apiExams {
		newExams, err := Convert(&apiExam, termId)
		if err != nil {
			return fmt.Errorf("failed to convert exams: %w", err)
		}
		exams = append(exams, newExams...)
	}
	return nil
}

func ImportAll(state *state.State) error {
	currentTermId := util.CurrentTermId()
	err := ImportByTerm(state, currentTermId)
	if err != nil {
		return fmt.Errorf("failed to import exams: %w", err)
	}
	return nil
}
