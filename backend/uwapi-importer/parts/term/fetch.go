package term

import (
	"encoding/json"
	"fmt"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/api"
)

func FetchAll(api *api.Api) ([]ApiEvent, error) {
	res, err := api.Getv3("ImportantDates")
	if err != nil {
		return nil, fmt.Errorf("http request failed: %w", err)
	}
	defer res.Body.Close()

	var events []ApiEvent
	err = json.NewDecoder(res.Body).Decode(&events)
	if err != nil {
		return nil, fmt.Errorf("decoding response failed: %w", err)
	}

	return events, nil
}
