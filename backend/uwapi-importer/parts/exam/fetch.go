package exam

import (
	"encoding/json"
	"fmt"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/api"
)

func FetchByTerm(api *api.Api, termId int) ([]ApiExam, error) {
	endpoint := fmt.Sprintf("terms/%d/examschedule", termId)
	res, err := api.Getv2(endpoint)
	if err != nil {
		return nil, fmt.Errorf("http request failed: %w", err)
	}
	defer res.Body.Close()

	var response ApiExamResponse
	err = json.NewDecoder(res.Body).Decode(&response)
	if err != nil {
		return nil, fmt.Errorf("decoding response failed: %w", err)
	}

	return response.Data, nil
}
