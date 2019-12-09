package section

import (
	"fmt"

	"flow/common/state"
	"flow/common/util"
	"flow/importer/uw/log"
)

const DeleteSectionQuery = `
DELETE FROM course_section
WHERE term_id < $1
`

const DeleteProfQuery= `
DELETE FROM prof p
WHERE NOT EXISTS (
    SELECT FROM review
    WHERE prof_id = p.id
    UNION ALL
    SELECT FROM section_meeting
    WHERE prof_id = p.id
);
`

func Vacuum(state *state.State) error {
	log.StartVacuum(state.Log, "section")
	// Retain only sections starting with the previous term
	tag, err := state.Db.Exec(DeleteSectionQuery, util.PreviousTermId())
	if err != nil {
		return fmt.Errorf("deleting old sections: %w", err)
	}
	log.EndVacuum(state.Log, "section", int(tag.RowsAffected()))

	log.StartVacuum(state.Log, "prof")
	tag, err = state.Db.Exec(DeleteProfQuery)
	if err != nil {
		return fmt.Errorf("deleting old profs: %w", err)
	}
	log.EndVacuum(state.Log, "prof", int(tag.RowsAffected()))
	return nil
}
