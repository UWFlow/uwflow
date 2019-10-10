package term

import (
	"fmt"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/state"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/util"
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
