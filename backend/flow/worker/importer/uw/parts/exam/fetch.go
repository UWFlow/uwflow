package exam

import (
	"fmt"

	"flow/worker/importer/uw/api"
)

func FetchByTerm(client *api.Client, termId int) ([]ApiExam, error) {
	var exams []ApiExam
	endpoint := fmt.Sprintf("terms/%d/examschedule", termId)
	err := client.Getv2(endpoint, &exams)
	return exams, err
}
