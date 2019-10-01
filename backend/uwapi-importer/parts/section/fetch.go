package section

import (
	"fmt"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/api"
)

func FetchByTerm(api *api.Api, termId int) ([]ApiSection, error) {
	var sections []ApiSection
	endpoint := fmt.Sprintf("terms/%d/schedule", termId)
	err := api.Getv2(endpoint, &sections)
	return sections, err
}
