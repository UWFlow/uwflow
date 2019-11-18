package section

import (
	"fmt"

	"flow/common/state"
	"flow/common/util"
	"flow/worker/importer/uw/log"
)

const DeleteQuery = `DELETE FROM course_section WHERE term < $1`

func Vacuum(state *state.State) error {
	log.StartVacuum(state.Log, "section")
	// Retain only sections starting with the previous term
	tag, err := state.Db.Exec(DeleteQuery, util.PreviousTermId())
	if err != nil {
		return fmt.Errorf("database write failed: %w", err)
	}
	log.EndVacuum(state.Log, "section", int(tag.RowsAffected()))
	return nil
}
