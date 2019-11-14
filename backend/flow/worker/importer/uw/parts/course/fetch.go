package course

import (
	"fmt"

	"flow/worker/importer/uw/api"
	"flow/worker/importer/uw/util"
)

type empty struct{}
type Semaphore chan empty

const RateLimit = 20

func FetchAll(api *api.Api) ([]Course, error) {
	handles, err := FetchHandles(api)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch handles: %w", err)
	}

	sema := make(Semaphore, RateLimit)
	datachan := make(chan *Course, len(handles))
	errorchan := make(chan error, len(handles))
	for _, handle := range handles {
		go asyncFetchByHandle(api, handle, sema, datachan, errorchan)
	}

	courses := make([]Course, len(handles))
	for i := 0; i < len(handles); i++ {
		select {
		case course := <-datachan:
			courses[i] = *course
		case err := <-errorchan:
			return nil, err
		}
	}
	return courses, nil
}

func asyncFetchByHandle(
	api *api.Api, handle CourseHandle,
	sema Semaphore, datachan chan *Course, errorchan chan error,
) {
	sema <- empty{}
	course, err := FetchByHandle(api, handle)
	if err != nil {
		errorchan <- err
	} else {
		datachan <- course
	}
	<-sema
}

func FetchByHandle(api *api.Api, handle CourseHandle) (*Course, error) {
	var course Course
	endpoint := fmt.Sprintf("courses/%s/%s", handle.Subject, handle.Number)
	err := api.Getv2(endpoint, &course)
	return &course, err
}

func FetchHandles(api *api.Api) ([]CourseHandle, error) {
	handles := make([]CourseHandle, 0)
	seenHandle := make(map[string]bool)
	// We are only intersted in the two upcoming terms
	termIds := []int{util.CurrentTermId(), util.NextTermId()}
	// Fetch hanles termwise with deduplication
	for _, termId := range termIds {
		termHandles, err := FetchHandlesByTerm(api, termId)
		if err != nil {
			return nil, fmt.Errorf("failed to fetch term %d: %w", termId, err)
		}
		for _, handle := range termHandles {
			if !seenHandle[handle.Subject+handle.Number] {
				handles = append(handles, handle)
				seenHandle[handle.Subject+handle.Number] = true
			}
		}
	}
	return handles, nil
}

func FetchHandlesByTerm(api *api.Api, termId int) ([]CourseHandle, error) {
	var handles []CourseHandle
	endpoint := fmt.Sprintf("terms/%d/courses", termId)
	err := api.Getv2(endpoint, &handles)
	return handles, err
}
