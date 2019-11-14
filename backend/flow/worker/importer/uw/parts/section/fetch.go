package section

import (
	"fmt"

	"flow/worker/importer/uw/api"
)

func FetchByTerm(client *api.Client, termId int) ([]ApiSection, error) {
	var sections []ApiSection
	endpoint := fmt.Sprintf("terms/%d/schedule", termId)
	err := client.Getv2(endpoint, &sections)
	return sections, err
}
