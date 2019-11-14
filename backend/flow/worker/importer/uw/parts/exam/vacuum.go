package exam

import "flow/worker/importer/uw/state"

func Vacuum(state *state.State) error {
	// Exams cascade from sections, so no deletion is necessary
	state.Log.StartVacuum("exam")
	state.Log.EndVacuum("exam", 0)
	return nil
}
