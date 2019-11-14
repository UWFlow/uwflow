package course

import (
	"fmt"

	"flow/common/util"
	"flow/worker/importer/uw/api"
)

type empty struct{}
type Semaphore chan empty

const RateLimit = 20

func FetchAll(client *api.Client) ([]Course, error) {
	handles, err := FetchHandles(client)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch handles: %w", err)
	}

	sema := make(Semaphore, RateLimit)
	datachan := make(chan *Course, len(handles))
	errorchan := make(chan error, len(handles))
	for _, handle := range handles {
		go asyncFetchByHandle(client, handle, sema, datachan, errorchan)
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
	client *api.Client, handle CourseHandle,
	sema Semaphore, datachan chan *Course, errorchan chan error,
) {
	sema <- empty{}
	course, err := FetchByHandle(client, handle)
	if err != nil {
		errorchan <- err
	} else {
		datachan <- course
	}
	<-sema
}

func FetchByHandle(client *api.Client, handle CourseHandle) (*Course, error) {
	var course Course
	endpoint := fmt.Sprintf("courses/%s/%s", handle.Subject, handle.Number)
	err := client.Getv2(endpoint, &course)
	return &course, err
}

func FetchHandles(client *api.Client) ([]CourseHandle, error) {
	handles := make([]CourseHandle, 0)
	seenHandle := make(map[string]bool)
	// We are only intersted in the two upcoming terms
	termIds := []int{util.CurrentTermId(), util.NextTermId()}
	// Fetch hanles termwise with deduplication
	for _, termId := range termIds {
		termHandles, err := FetchHandlesByTerm(client, termId)
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

func FetchHandlesByTerm(client *api.Client, termId int) ([]CourseHandle, error) {
	var handles []CourseHandle
	endpoint := fmt.Sprintf("terms/%d/courses", termId)
	err := client.Getv2(endpoint, &handles)
	return handles, err
}
