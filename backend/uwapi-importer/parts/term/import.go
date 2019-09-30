package term

import (
	"encoding/json"
	"fmt"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/state"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/util"
)

// We would like to use persistent ids here, but none are available.
// As per UW API v3 documentation:
//  id: [...] unique, *non-persistent* Api Id [...]
// As long as this remains the case, string comparisons will be necessary.
const (
	StartEventName = "Classes begin"
	EndEventName   = "Classes end"
)

func ImportAll(state *state.State) error {
	state.Log.StartImport("term")

	res, err := state.Api.Getv3("ImportantDates")
	if err != nil {
		return fmt.Errorf("http request failed: %w", err)
	}

	var events []ApiEvent
	err = json.NewDecoder(res.Body).Decode(&events)
	if err != nil {
		return fmt.Errorf("decoding response failed: %w", err)
	}

	var startDetails, endDetails []ApiEventDetail
	for _, event := range events {
		switch event.Name {
		case StartEventName:
			startDetails = append(startDetails, event.Details...)
		case EndEventName:
			endDetails = append(endDetails, event.Details...)
		}
	}

	termEndDate := make(map[int]string)
	for _, detail := range endDetails {
		termId, err := util.TermNameToId(detail.TermName)
		if err != nil {
			state.Log.ApiBug("invalid term name in end event", detail.TermName)
			continue
		}
		termEndDate[termId] = detail.Date
	}

	succeeded, failed := 0, 0
	for _, detail := range startDetails {
		termId, err := util.TermNameToId(detail.TermName)
		if err != nil {
			state.Log.ApiBug("invalid term name in start event", detail.TermName)
			failed++
			continue
		}

		endDate, found := termEndDate[termId]
		if !found {
			state.Log.ApiBug("unmatched term in start event", detail.TermName)
			failed++
			continue
		}

		term := Term{TermId: termId, StartDate: detail.Date, EndDate: endDate}
		err = Insert(state.Db, &term)
		if err != nil {
			return fmt.Errorf("inserting term failed: %w", err)
		}
		succeeded++
	}

	state.Log.EndImport("term", succeeded, failed)
	return nil
}
