// Dates of start and end of lectures at UW for each term.
//
// Unfortunately, the seemingly fitting Terms endpoint is useless for the task:
// it aligns dates to month boundaries, producing records of the form
//
// | 1169 | 2016-09-01 | 2016-12-31 |
//
// Such dates are trivial to generate without the help of the API,
// but the *days* of the month when lectures start and end remain unknown.
// Those are crucial: they determine when events start and end in calendars.
//
// Fortunately, the ImportantDates endpoint can provide this information,
// though it is not ergonomic as start and end dates must be manually matched.
package term

// In this script, we only ever need the string representations,
// so no need to bother with time.Time conversions.
type Term struct {
	TermId    int
	StartDate string
	EndDate   string
}

// In UW API v3 spec, these are called ImportantDates,
// but that collides with the Date that is nested inside,
// so we prefer to call them Events, which is also shorter.
type ApiEvent struct {
	Name    string
	Details []ApiEventDetail
}

// Likewise, these are ImportantDateDetails in API spec
type ApiEventDetail struct {
	// Of the form "Fall 2019"
	TermName string
	// In our case, start and end dates conincide,
	// so EndDate is nil and this is simply the date.
	Date string `json:"StartDate"`
}
