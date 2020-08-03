package course

import (
	"fmt"

	"flow/common/util"
	"flow/importer/uw/api"
)

type empty struct{}
type semaphore chan empty

const rateLimit = 20

func fetchAll(client *api.Client) ([]apiCourse, error) {
	courses, err := fetchStubs(client)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch handles: %w", err)
	}

	sema := make(semaphore, rateLimit)
	errch := make(chan error, len(courses))
	for i := range courses {
		go asyncFillStub(client, &courses[i], sema, errch)
	}

	for i := 0; i < len(courses); i++ {
		err = <-errch
		if err != nil {
			return nil, err
		}
	}

	return courses, nil
}

func asyncFillStub(client *api.Client, stub *apiCourse, sema semaphore, errch chan error) {
	sema <- empty{}
	errch <- fillStub(client, stub)
	<-sema
}

func fillStub(client *api.Client, stub *apiCourse) error {
	endpoint := fmt.Sprintf("courses/%s/%s", stub.Subject, stub.Number)
	return client.Getv2(endpoint, &stub)
}

// fetchStubs fetches {subject, number, name} in apiCourse.
func fetchStubs(client *api.Client) ([]apiCourse, error) {
	var stubs []apiCourse
	seenStub := make(map[string]bool)
	// We are only intersted in the two upcoming terms
	termIds := []int{util.CurrentTermId(), util.NextTermId()}
	// Fetch stubs termwise with deduplication
	for _, termId := range termIds {
		termStubs, err := fetchStubsByTerm(client, termId)
		if err != nil {
			return nil, fmt.Errorf("failed to fetch term %d: %w", termId, err)
		}
		for _, stub := range termStubs {
			if !seenStub[stub.Subject+stub.Number] {
				stubs = append(stubs, stub)
				seenStub[stub.Subject+stub.Number] = true
			}
		}
	}
	return stubs, nil
}

func fetchStubsByTerm(client *api.Client, termId int) ([]apiCourse, error) {
	var stubs []apiCourse
	endpoint := fmt.Sprintf("terms/%d/courses", termId)
	err := client.Getv2(endpoint, &stubs)
	return stubs, err
}
