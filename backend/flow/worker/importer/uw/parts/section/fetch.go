package section

import (
	"fmt"

	"flow/worker/importer/uw/api"
)

func FetchByTerm(api *api.Api, termId int) ([]ApiSection, error) {
	var sections []ApiSection
	endpoint := fmt.Sprintf("terms/%d/schedule", termId)
	err := api.Getv2(endpoint, &sections)
	return sections, err
}
