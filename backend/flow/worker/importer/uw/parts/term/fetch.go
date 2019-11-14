package term

import "flow/worker/importer/uw/api"

func FetchAll(api *api.Api) ([]ApiEvent, error) {
	var events []ApiEvent
	err := api.Getv3("ImportantDates", &events)
	return events, err
}
