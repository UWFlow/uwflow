// This implementation is pursuant to RFC 5545.
// Whenever a section number is cited, it is in reference to the said RFC.
package calendar

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"flow/api/serde"
	"flow/common/db"

	"github.com/go-chi/chi/v5"
)

type postgresEvent struct {
	SectionId    int
	CourseCode   string
	SectionName  string
	Location     *string
	StartDate    time.Time
	EndDate      time.Time
	StartSeconds int
	EndSeconds   int
	Days         []string
	// HasDay[x] is true if event occurs on weekday x
	HasDay [7]bool
}

type webcalEvent struct {
	// An identifier such that (groupid, timestamp) is globally unique.
	// For example, section ids have this property.
	GroupId   int
	Summary   string
	StartTime time.Time
	EndTime   time.Time
	Location  string
}

// 3.3.5 DATE-TIME
// UTC timestamp format is YYYYMMDD | "T" | HHmmss | "Z"
const (
	dbDateFormat       = "2006-01-02"
	icsTimestampFormat = "20060102T150405Z"
)

// 3.1 CONTENT LINES
//   - delimited by a line break, which is a CRLF sequence
//   - CRLF followed immediately by a single linear white-space character is ignored
//     (therefore, we must take care to never have a leading space on a line)
const webcalPreamble = ("BEGIN:VCALENDAR\r\n" +
	// 3.7.3 PRODID: TEXT
	// - MUST be specified once in an iCalendar object
	// - vendor [...] SHOULD assure that this is a globally unique identifier
	//
	// We take it to be -//uwflow.com//$SECRET_ID//EN accoring to convention.
	"PRODID:-//uwflow.com//%s//EN\r\n" +
	// 3.7.4 VERSION: TEXT
	// - MUST be specified once in an iCalendar object
	// - A value of "2.0" corresponds to [RFC 5545]
	"VERSION:2.0\r\n" +
	// The following are non-standard (3.8.8.2) properties recognized by Google Calendar
	"X-WR-CALDESC:Schedule exported from https://uwflow.com\r\n" +
	"X-WR-CALNAME:UW Flow schedule\r\n")

const webcalEventTemplate = ("BEGIN:VEVENT\r\n" +
	// 3.8.1.12 SUMMARY: TEXT
	// - CAN be specified [...] to capture a short, one-line summary about the activity
	//
	// We use strings of the form "ECE105 - LEC 001" or "ECE105 - FINAL"
	"SUMMARY:%s\r\n" +
	// 3.8.4.7 UNIQUE IDENTIFIER: TEXT
	// - MUST be specified in the "VEVENT" [...] [component]
	// - MUST be a globally unique identifier
	//
	// We use -//uwflow.com//$SECRET_ID//$SECTION_ID//$DTSTART//EN
	"UID:-//uwflow.com//%s//%04d//%d//EN\r\n" +
	// 3.8.2.4 DTSTART: DATE-TIME
	// - defines the start date and time for the event
	"DTSTART:%s\r\n" +
	// 3.8.2.2 DTEND: DATE-TIME
	// - defines the end date and time for the event
	// - MUST be later in time than the value of the "DTSTART" property
	// - MUST be specified as a date with local time
	//   if and only if the "DTSTART" property is also specified as a date with local time
	//
	// We can use local time (with explicit TZID=Canada/Eastern), UTC time or floating time
	// ("picture of a clock", like TIMEZONE WITHOUT TIMESTAMP in SQL).
	// We use UTC time in both cases: Google Calendar unfortunately treats floating as UTC,
	// and local time is complex, seemingly requiring a handcrafted VTIMEZONE entity.
	"DTEND:%s\r\n" +
	// 3.8.7.2 DTSTAMP: DATE-TIME
	// - specifies the date and time that the instance of the iCalendar object was created
	//
	// Unlike the previous timestamps, this one is given in UTC time.
	// This is because we don't want to bother with the server timezone.
	"DTSTAMP:%s\r\n" +
	// 3.8.1.7 LOCATION: TEXT
	// - defines the intended venue for the activity defined by a calendar component
	//
	// This is the building-room location of a meeting, e.g. "MC 4085"
	"LOCATION:%s\r\n" +
	"END:VEVENT\r\n")

var (
	dayToIndex = map[string]int{
		"Su": 0,
		"M":  1,
		"T":  2,
		"W":  3,
		"Th": 4,
		"F":  5,
		"S":  6,
	}
)

func writeCalendar(w io.Writer, secretId string, events []*webcalEvent) {
	createTime := time.Now()

	fmt.Fprintf(w, webcalPreamble, secretId)

	createTimeString := createTime.UTC().Format(icsTimestampFormat)
	for _, event := range events {
		startTimeString := event.StartTime.Format(icsTimestampFormat)
		endTimeString := event.EndTime.Format(icsTimestampFormat)
		fmt.Fprintf(
			w, webcalEventTemplate,
			event.Summary, secretId, event.GroupId, event.StartTime.Unix(),
			startTimeString, endTimeString, createTimeString, event.Location,
		)
	}
	io.WriteString(w, "END:VCALENDAR\r\n")
}

const selectEventQuery = `
SELECT
  sm.section_id, c.code, cs.section_name, COALESCE(NULLIF(us.location, ''), sm.location),
  sm.start_date :: TEXT, sm.end_date :: TEXT,
  sm.start_seconds, sm.end_seconds, sm.days
FROM
  user_schedule us
  JOIN course_section cs ON cs.id = us.section_id
  JOIN section_meeting sm ON sm.section_id = us.section_id
  JOIN course c ON c.id = cs.course_id
WHERE us.user_id = $1
	-- Fetch meetings where start_seconds and end_seconds are present.
	-- Otherwise, we cannot say anything useful about when they take place.
  AND sm.start_seconds IS NOT NULL
  AND sm.end_seconds IS NOT NULL
`

const userIdQuery = `SELECT id FROM "user" WHERE secret_id = $1`

func extractUserEvents(conn *db.Conn, secretId string) ([]*postgresEvent, error) {
	var events []*postgresEvent

	var userId int
	err := conn.QueryRow(userIdQuery, secretId).Scan(&userId)
	if err != nil {
		return nil, fmt.Errorf("no user with secret id %s", secretId)
	}

	rows, err := conn.Query(selectEventQuery, userId)
	if err != nil {
		return nil, fmt.Errorf("querying events: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var ev postgresEvent
		var startDateStr, endDateStr string

		err = rows.Scan(
			&ev.SectionId, &ev.CourseCode, &ev.SectionName, &ev.Location,
			&startDateStr, &endDateStr, &ev.StartSeconds, &ev.EndSeconds, &ev.Days,
		)
		if err != nil {
			return nil, fmt.Errorf("reading event row: %w", err)
		}

		// Instead of parsing directly into time.Time, we go through strings
		// to specify the right timezone. This sounds slow, but it's better
		// than fixing up after each postgresEvent gets exploded into many webcalEvents.
		ev.StartDate, _ = time.ParseInLocation(dbDateFormat, startDateStr, UniversityLocation)
		ev.EndDate, _ = time.ParseInLocation(dbDateFormat, endDateStr, UniversityLocation)

		for _, day := range ev.Days {
			ev.HasDay[dayToIndex[day]] = true
		}

		events = append(events, &ev)
	}

	return events, nil
}

func postgresToWebcalEvent(event *postgresEvent, date time.Time) *webcalEvent {
	var location string
	if event.Location != nil {
		location = *event.Location
	} else {
		location = "Unknown"
	}

	var summary = strings.ToUpper(event.CourseCode)
	summary = fmt.Sprintf("%s - %s", summary, event.SectionName)

	return &webcalEvent{
		GroupId:   event.SectionId,
		Summary:   summary,
		StartTime: date.Add(time.Second * time.Duration(event.StartSeconds)).UTC(),
		EndTime:   date.Add(time.Second * time.Duration(event.EndSeconds)).UTC(),
		Location:  location,
	}
}

func postgresToWebcalEvents(events []*postgresEvent) ([]*webcalEvent, error) {
	var webcalEvents []*webcalEvent

	for _, event := range events {
		// Walk entire date range for each event. It would be more efficient
		// to map days to events and walk the union of date ranges for all events simultaneously,
		// but this is so fast as-is that the difference is negligible.
		for date := event.StartDate; !date.After(event.EndDate); date = date.AddDate(0, 0, 1) {
			if event.HasDay[int(date.Weekday())] {
				webcalEvents = append(webcalEvents, postgresToWebcalEvent(event, date))
			}
		}
	}

	return webcalEvents, nil
}

func HandleCalendar(conn *db.Conn, w http.ResponseWriter, r *http.Request) error {
	secretId := chi.URLParam(r, "secretId")

	events, err := extractUserEvents(conn, secretId)
	if err != nil {
		return serde.WithStatus(http.StatusUnauthorized, fmt.Errorf("extracting events: %w", err))
	}

	webcalEvents, err := postgresToWebcalEvents(events)
	if err != nil {
		return fmt.Errorf("converting events: %w", err)
	}

	// The name of the downloaded file should be user-friendly and not $SECRET_ID.ics
	w.Header().Set("Content-Disposition", "attachment; filename=uwflow.ics")
	// Google Calendar requires explicit charset
	w.Header().Set("Content-Type", `text/calendar; charset="utf-8"`)
	w.WriteHeader(http.StatusCreated)
	writeCalendar(w, secretId, webcalEvents)

	return nil
}
