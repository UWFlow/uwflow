package term

import (
	"fmt"
	"time"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/util"
)

// This is *almost* ISO8601, but ever so slightly off (no timezone)
// Unfortunately, this forces us to reify the parsing process.
const DateLayout     = "2006-01-02T15:04:05"

// We would like to use persistent ids here, but none are available.
// As per UW API v3 documentation:
//  id: [...] unique, *non-persistent* Api Id [...]
// As long as this remains the case, string comparisons will be necessary.
const (
	StartEventName = "Classes begin"
	EndEventName   = "Classes end"
)

func ConvertAll(events []ApiEvent) ([]Term, error) {
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
			return nil, fmt.Errorf("invalid term name: %s", detail.TermName)
		}
		termEndDate[termId] = detail.Date
	}

	terms := make([]Term, len(startDetails))
	for i, detail := range startDetails {
		termId, err := util.TermNameToId(detail.TermName)
		if err != nil {
			return nil, fmt.Errorf("invalid term name: %s", detail.TermName)
		}

		endDetailDate, found := termEndDate[termId]
		if !found {
			return nil, fmt.Errorf("unmatched term in start event: %s", detail.TermName)
		}

		startDate, err := time.Parse(DateLayout, detail.Date)
		if err != nil {
			return nil, fmt.Errorf("failed to parse date: %w", err)
		}
		endDate, err := time.Parse(DateLayout, endDetailDate)
		if err != nil {
			return nil, fmt.Errorf("failed to parse date: %w", err)
		}

		terms[i] = Term{
			Id:        termId,
			StartDate: startDate,
			EndDate:   endDate,
		}
	}

	return terms, nil
}
