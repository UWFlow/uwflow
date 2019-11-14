package course

import "flow/worker/importer/uw/state"

func Vacuum(state *state.State) error {
	state.Log.StartVacuum("course")
	state.Log.EndVacuum("course", 0)
	// Never delete past courses
	return nil
}
