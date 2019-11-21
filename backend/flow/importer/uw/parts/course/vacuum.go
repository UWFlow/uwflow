package course

import (
	"flow/common/state"
	"flow/importer/uw/log"
)

func Vacuum(state *state.State) error {
	log.StartVacuum(state.Log, "course")
	// Never delete past courses
	log.EndVacuum(state.Log, "course", 0)
	return nil
}
