package term

import "flow/worker/importer/uw/api"

func FetchAll(client *api.Client) ([]ApiEvent, error) {
	var events []ApiEvent
	err := client.Getv3("ImportantDates", &events)
	return events, err
}
