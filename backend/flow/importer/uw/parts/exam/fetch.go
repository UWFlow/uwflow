package exam

import (
	"fmt"

	"flow/importer/uw/api"
)

func FetchByTerm(client *api.Client, termId int) ([]ApiExam, error) {
	var exams []ApiExam
	endpoint := fmt.Sprintf("terms/%d/examschedule", termId)
	err := client.Getv2(endpoint, &exams)
	return exams, err
}
