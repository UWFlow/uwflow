package course

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/api"
)

func FetchById(api *api.Api, id string) (*Course, error) {
	res, err := api.Getv2(fmt.Sprintf("courses/%s", id))
	if err != nil {
		return nil, fmt.Errorf("http request failed: %w", err)
	}

	var response ApiCourseDetailResponse
	err = json.NewDecoder(res.Body).Decode(&response)
	if err != nil {
		return nil, fmt.Errorf("decoding response failed: %w", err)
	}

	detail := &response.Data
	code := strings.ToLower(detail.Subject) + strings.ToLower(detail.CatalogNumber)
	course := Course{
		Code:        code,
		Name:        detail.Title,
		Description: detail.Description,
		Prereqs:     detail.Prerequisites,
		Coreqs:      detail.Corequisites,
		Antireqs:    detail.Antirequisites,
	}
	return &course, nil
}

func FetchList(api *api.Api) ([]ApiCourseListItem, error) {
	res, err := api.Getv2("courses")
	if err != nil {
		return nil, fmt.Errorf("http request failed: %w", err)
	}

	var response ApiCourseListResponse
	err = json.NewDecoder(res.Body).Decode(&response)
	if err != nil {
		return nil, fmt.Errorf("decoding response failed: %w", err)
	}

	return response.Data, nil
}
