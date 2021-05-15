package term

import (
	"fmt"

	"flow/common/state"
	"flow/common/util"
	"flow/importer/uw/log"
)

const deleteQuery = `DELETE FROM term WHERE id < $1`

func Vacuum(state *state.State) error {
	log.StartVacuum("term")
	// Retain only terms starting with the previous one
	tag, err := state.Db.Exec(deleteQuery, util.PreviousTermId(2))
	if err != nil {
		return fmt.Errorf("database write failed: %w", err)
	}
	log.EndVacuum("term", int(tag.RowsAffected()))
	return nil
}
