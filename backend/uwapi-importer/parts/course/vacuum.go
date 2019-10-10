package course

import "github.com/AyushK1/uwflow2.0/backend/uwapi-importer/state"

func Vacuum(state *state.State) error {
	state.Log.StartVacuum("course")
	state.Log.EndVacuum("course", 0)
	// Never delete past courses
	return nil
}
