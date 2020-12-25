package term

import "flow/importer/uw/api"

func fetchAll(client *api.Client) ([]apiEvent, error) {
	var events []apiEvent
	err := client.Getv3("ImportantDates", &events)
	return events, err
}
