package course

import (
	"fmt"

	"flow/common/state"
	"flow/common/util"
	"flow/importer/uw/log"
)

const deleteSectionQuery = `
DELETE FROM course_section
WHERE term_id < $1
`

const deleteProfQuery = `
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
	log.StartVacuum("course")
	// Never delete past courses
	log.EndVacuum("course", 0)

	log.StartVacuum("section")
	// Retain only sections starting with the previous term
	tag, err := state.Db.Exec(deleteSectionQuery, util.PreviousTermId(2))
	if err != nil {
		return fmt.Errorf("deleting old sections: %w", err)
	}
	log.EndVacuum("section", int(tag.RowsAffected()))

	log.StartVacuum("prof")
	tag, err = state.Db.Exec(deleteProfQuery)
	if err != nil {
		return fmt.Errorf("deleting old profs: %w", err)
	}
	log.EndVacuum("prof", int(tag.RowsAffected()))

	return nil
}
