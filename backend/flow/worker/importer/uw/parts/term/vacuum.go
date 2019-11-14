package term

import (
	"fmt"

	"flow/worker/importer/uw/state"
	"flow/worker/importer/uw/util"
)

const DeleteQuery = `DELETE FROM term_date WHERE term < $1`

func Vacuum(state *state.State) error {
	state.Log.StartVacuum("term")
	// Retain only terms starting with the previous one
	tag, err := state.Db.Exec(DeleteQuery, util.PreviousTermId())
	if err != nil {
		return fmt.Errorf("database write failed: %w", err)
	}
	state.Log.EndVacuum("term", int(tag.RowsAffected()))
	return nil
}
