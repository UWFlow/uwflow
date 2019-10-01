package term

import "github.com/AyushK1/uwflow2.0/backend/uwapi-importer/api"

func FetchAll(api *api.Api) ([]ApiEvent, error) {
	var events []ApiEvent
	err := api.Getv3("ImportantDates", &events)
	return events, err
}
