package course

import (
	"fmt"

	"flow/common/util"
	"flow/importer/uw/api"
)

type empty struct{}
type Semaphore chan empty

const RateLimit = 20

func FetchAll(client *api.Client) ([]ApiCourse, error) {
	handles, err := FetchHandles(client)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch handles: %w", err)
	}

	sema := make(Semaphore, RateLimit)
	datachan := make(chan *ApiCourse, len(handles))
	errorchan := make(chan error, len(handles))
	for _, handle := range handles {
		go asyncFetchByHandle(client, handle, sema, datachan, errorchan)
	}

	courses := make([]ApiCourse, len(handles))
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
	client *api.Client, handle ApiCourseHandle,
	sema Semaphore, datachan chan *ApiCourse, errorchan chan error,
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

func FetchByHandle(client *api.Client, handle ApiCourseHandle) (*ApiCourse, error) {
	var course ApiCourse
	endpoint := fmt.Sprintf("courses/%s/%s", handle.Subject, handle.Number)
	err := client.Getv2(endpoint, &course)
	return &course, err
}

func FetchHandles(client *api.Client) ([]ApiCourseHandle, error) {
	handles := make([]ApiCourseHandle, 0)
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

func FetchHandlesByTerm(client *api.Client, termId int) ([]ApiCourseHandle, error) {
	var handles []ApiCourseHandle
	endpoint := fmt.Sprintf("terms/%d/courses", termId)
	err := client.Getv2(endpoint, &handles)
	return handles, err
}
