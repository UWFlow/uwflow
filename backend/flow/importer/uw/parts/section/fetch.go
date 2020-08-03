package section

import (
	"fmt"

	"flow/importer/uw/api"
)

func fetchByTerm(client *api.Client, termId int) ([]apiSection, error) {
	var sections []apiSection
	endpoint := fmt.Sprintf("terms/%d/schedule", termId)
	err := client.Getv2(endpoint, &sections)
	return sections, err
}
