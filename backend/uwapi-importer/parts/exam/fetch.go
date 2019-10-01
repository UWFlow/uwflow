package exam

import (
	"fmt"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/api"
)

func FetchByTerm(api *api.Api, termId int) ([]ApiExam, error) {
  var exams []ApiExam
  endpoint := fmt.Sprintf("terms/%d/examschedule", termId)
	err := api.Getv2(endpoint, exams)
	if err != nil {
		return nil, fmt.Errorf("http request failed: %w", err)
	}
	return exams, nil
}
