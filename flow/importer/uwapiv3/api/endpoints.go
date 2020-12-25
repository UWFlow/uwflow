package api

// Event represents a university-related event
// such as the start or end of a term.
//
// In UW API v3 spec, these are called ImportantDates,
// but that collides with the Date that is nested inside,
// so we prefer to call them Events, which is also shorter.
type Event struct {
	Name       string           `json:"name"`
	Occurences []EventOccurence `json:"details"`
}

// EventOccurence represents an occurence of an Event.
//
// Likewise, these are ImportantDateDetails in the API spec.
type EventOccurence struct {
	TermName  string `json:"termName"` // "Fall 2019"
	StartDate Date   `json:"startDate"`
	EndDate   Date   `json:"endDate"`
}

// Events returns all events on record.
func (c *Client) Events() ([]Event, error) {
	var events []Event
	err := c.get("ImportantDates", &events)
	return events, err
}
