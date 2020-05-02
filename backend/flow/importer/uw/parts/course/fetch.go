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
	courses, err := FetchStubs(client)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch stubs: %w", err)
	}

	sema := make(Semaphore, RateLimit)
	errorchan := make(chan error)
	for i := range courses {
		go asyncFillStub(client, &courses[i], sema, errorchan)
	}
	for _ = range courses {
		err = <-errorchan
		if err != nil {
			return nil, err
		}
	}

	return courses, nil
}

func asyncFillStub(client *api.Client, stub *ApiCourse, sema Semaphore, errorchan chan error) {
	sema <- empty{}
	errorchan <- FillStub(client, stub)
	<-sema
}

func FillStub(client *api.Client, stub *ApiCourse) error {
	endpoint := fmt.Sprintf("courses/%s/%s", stub.Subject, stub.Number)
	return client.Getv2(endpoint, &stub)
}

// Fetches only {subject, number, name}
func FetchStubs(client *api.Client) ([]ApiCourse, error) {
	var stubs []ApiCourse
	seenStub := make(map[string]bool)
	// We are only intersted in the two upcoming terms
	termIds := []int{util.CurrentTermId(), util.NextTermId()}
	// Fetch hanles termwise with deduplication
	for _, termId := range termIds {
		termStubs, err := FetchStubsByTerm(client, termId)
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

// Fetches only {subject, number, name}
func FetchStubsByTerm(client *api.Client, termId int) ([]ApiCourse, error) {
	var stubs []ApiCourse
	endpoint := fmt.Sprintf("terms/%d/courses", termId)
	err := client.Getv2(endpoint, &stubs)
	return stubs, err
}
