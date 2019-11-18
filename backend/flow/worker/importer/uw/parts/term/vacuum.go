package term

import (
	"fmt"

	"flow/common/state"
	"flow/common/util"
	"flow/worker/importer/uw/log"
)

const DeleteQuery = `DELETE FROM term_date WHERE term < $1`

func Vacuum(state *state.State) error {
	log.StartVacuum(state.Log, "term")
	// Retain only terms starting with the previous one
	tag, err := state.Db.Exec(DeleteQuery, util.PreviousTermId())
	if err != nil {
		return fmt.Errorf("database write failed: %w", err)
	}
	log.EndVacuum(state.Log, "term", int(tag.RowsAffected()))
	return nil
}
