package course

import (
	"fmt"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/state"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/util"
)

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

func ImportAll(state *state.State) error {
	state.Log.StartImport("course")

	list, err := FetchList(state.Api)
	if err != nil {
		return fmt.Errorf("fetching course list failed: %w", err)
	}

	closures := make([]util.FallibleClosure, len(list))
	for i, item := range list {
		// Note:
		//  func() error { return ImportById(state, item.CourseId) }
		// would be *incorrect*: item is bound by reference,
		// so would be captured by reference in the closure.
		// item.CourseId would evaluate to that of the last item in all closures.
		// The line below fixes id before capturing it.
		id := item.CourseId
		closures[i] = func() error { return ImportById(state, id) }
	}

	succeeded, failed := util.RunConcurrently(closures)
	state.Log.EndImport("course", succeeded, 0, failed)
	return nil
}
