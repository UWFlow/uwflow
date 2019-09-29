package parts

import (
	"encoding/json"
	"fmt"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/state"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/util"
)

type ImportantDateDetail struct {
	TermName  string
	StartDate *string
	EndDate   *string
}

type ImportantDate struct {
	Id      int
	Details []ImportantDateDetail
}

const (
	EndRecordId   = 60
	StartRecordId = 80
)

const InsertQuery = `
INSERT INTO term_date(term, start_date, end_date) VALUES ($1, $2, $3)
ON CONFLICT (term) DO UPDATE
SET start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date`

func ImportantDates(instance *state.State) error {
	res, err := instance.Api.Getv3("ImportantDates")
	if err != nil {
		return fmt.Errorf("http request failed: %w", err)
	}
	if res.StatusCode >= 400 {
		return fmt.Errorf("http request failed: %v", res.Status)
	}

	var records []ImportantDate
	err = json.NewDecoder(res.Body).Decode(&records)
	if err != nil {
		return fmt.Errorf("decoding response failed: %w", err)
	}

	var startDetails, endDetails []ImportantDateDetail
	for _, record := range records {
		if record.Id == StartRecordId {
			startDetails = record.Details
		} else if record.Id == EndRecordId {
			endDetails = record.Details
		}
	}

	if startDetails == nil {
		return fmt.Errorf("no term start record")
	}
	if endDetails == nil {
		return fmt.Errorf("no term end record")
	}

	termToEndDate := make(map[int]*string)
	for _, detail := range endDetails {
		termId, err := util.TermNameToId(detail.TermName)
		if err != nil {
			util.LogApiBug("invalid term name %q in endDate", detail.TermName)
			continue
		}
		termToEndDate[termId] = detail.StartDate
	}

	for _, detail := range startDetails {
		termId, err := util.TermNameToId(detail.TermName)
		if err != nil {
			util.LogApiBug("invalid term name %q in startDate", detail.TermName)
			continue
		}

		endDate, found := termToEndDate[termId]
		if !found {
			util.LogApiBug("unmatched term %q in startDate", detail.TermName)
			continue
		}

		_, err = instance.Db.Exec(InsertQuery, termId, detail.StartDate, endDate)
		if err != nil {
			return fmt.Errorf("database write failed: %w", err)
		}
	}
	return nil
}
