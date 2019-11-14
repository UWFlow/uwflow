package exam

import (
	"fmt"

	"flow/worker/importer/uw/api"
)

func FetchByTerm(api *api.Api, termId int) ([]ApiExam, error) {
	var exams []ApiExam
	endpoint := fmt.Sprintf("terms/%d/examschedule", termId)
	err := api.Getv2(endpoint, &exams)
	return exams, err
}
