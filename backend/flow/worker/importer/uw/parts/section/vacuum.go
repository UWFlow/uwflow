package section

import (
	"fmt"

	"flow/worker/importer/uw/state"
	"flow/worker/importer/uw/util"
)

const DeleteQuery = `DELETE FROM course_section WHERE term < $1`

func Vacuum(state *state.State) error {
	state.Log.StartVacuum("section")
	// Retain only sections starting with the previous term
	tag, err := state.Db.Exec(DeleteQuery, util.PreviousTermId())
	if err != nil {
		return fmt.Errorf("database write failed: %w", err)
	}
	state.Log.EndVacuum("section", int(tag.RowsAffected()))
	return nil
}
