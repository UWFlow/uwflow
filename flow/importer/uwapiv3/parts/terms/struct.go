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
package terms

import "time"

// Term represents an academic term.
type Term struct {
	Id        int // 1211 <-> Winter 2021
	StartDate time.Time
	EndDate   time.Time
}
