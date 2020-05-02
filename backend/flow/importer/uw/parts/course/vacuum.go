package course

import (
	"flow/common/state"
	"flow/importer/uw/log"
)

func Vacuum(state *state.State) error {
	log.StartVacuum("course")
	// Never delete past courses
	log.EndVacuum("course", 0)
	return nil
}
