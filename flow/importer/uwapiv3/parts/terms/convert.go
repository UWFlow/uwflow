package terms

import (
	"fmt"
	"time"

	"flow/common/util"
	"flow/importer/uwapiv3/api"
)

// We would like to use persistent ids here, but none are available.
// As per UW API v3 documentation:
//  id: [...] unique, *non-persistent* Api Id [...]
// As long as this remains the case, string comparisons will be necessary.
const (
	startEventName = "Classes begin"
	endEventName   = "Classes end"
)

func (t *termImporter) convert(events []api.Event) error {
	var starts, ends []api.EventOccurence
	for _, event := range events {
		switch event.Name {
		case startEventName:
			starts = append(starts, event.Occurences...)
		case endEventName:
			ends = append(ends, event.Occurences...)
		}
	}

	termEndDate := make(map[int]time.Time, len(ends))
	for _, occurence := range ends {
		termId, err := util.TermNameToId(occurence.TermName)
		if err != nil {
			return fmt.Errorf("invalid term name: %s", occurence.TermName)
		}
		termEndDate[termId] = occurence.StartDate.Value
	}

	t.terms = make([]Term, len(starts))
	for i, occurence := range starts {
		termId, err := util.TermNameToId(occurence.TermName)
		if err != nil {
			return fmt.Errorf("invalid term name: %s", occurence.TermName)
		}

		startDate := occurence.StartDate.Value
		endDate, found := termEndDate[termId]
		if !found {
			return fmt.Errorf("unmatched term in start event: %s", occurence.TermName)
		}

		t.terms[i] = Term{
			Id:        termId,
			StartDate: startDate,
			EndDate:   endDate,
		}
	}

	return nil
}
