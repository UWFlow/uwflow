package course

import (
	"fmt"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/state"
)

type empty struct{}

const RateLimit = 10

func ImportById(state *state.State, id string) error {
	course, err := FetchById(state.Api, id)
	if err != nil {
		return fmt.Errorf("failed to fetch: %w", err)
	}
	err = Insert(state.Db, course)
	if err != nil {
		return fmt.Errorf("failed to save: %w", err)
	}
	return nil
}

func importOneConcurrently(state *state.State, id string,
	ctlch chan empty, errch chan error) {
	ctlch <- empty{}
	errch <- ImportById(state, id)
	<-ctlch
}

func ImportAll(state *state.State) error {
	state.Log.StartImport("course")

	list, err := FetchList(state.Api)
	if err != nil {
		return fmt.Errorf("fetching course list failed: %w", err)
	}

	ctlch := make(chan empty, RateLimit)
	errch := make(chan error, len(list))
	for _, item := range list {
		go importOneConcurrently(state, item.CourseId, ctlch, errch)
	}

	succeeded, failed, N := 0, 0, len(list)
	for succeeded+failed < N {
		err := <-errch
		if err != nil {
			state.Log.Zap.Error(err.Error())
			failed++
		} else {
			succeeded++
		}
	}

	state.Log.EndImport("course", succeeded, failed)
	return nil
}
