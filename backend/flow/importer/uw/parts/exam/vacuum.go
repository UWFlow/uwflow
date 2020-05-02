package exam

import (
	"flow/common/state"
	"flow/importer/uw/log"
)

func Vacuum(state *state.State) error {
	log.StartVacuum("exam")
	// Exams cascade from sections, so no deletion is necessary
	log.EndVacuum("exam", 0)
	return nil
}
