package webcal

import (
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/AyushK1/uwflow2.0/backend/api/serde"
	"github.com/AyushK1/uwflow2.0/backend/api/state"
	"github.com/go-chi/chi"
)

type PostgresEvent struct {
	CourseCode   string
	SectionName  string
	CourseName   string
	Location     *string
	StartDate    *time.Time
	EndDate      *time.Time
	StartSeconds int
	EndSeconds   int
  Days         []string
}

type WebcalEvent struct {
	Summary   string
	StartTime time.Time
	EndTime   time.Time
	Location  string
}

const WebcalPreamble = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//UW Flow//uwflow.com//EN
X-WR-CALDESC:Schedule exported from https://uwflow.com
X-WR-CALNAME:UW Flow schedule
`

const WebcalEventTemplate = `BEGIN:VEVENT
SUMMARY:%s
DTSTART;VALUE=DATE-TIME:%s
DTEND;VALUE=DATE-TIME:%s
DTSTAMP;VALUE=DATE-TIME:%s
LOCATION:%s
END:VEVENT
`

var (
  DayMap = map[string]int{
    "Su": 0,
    "M": 1,
    "Tu": 2,
    "W": 3,
    "Th": 4,
    "F": 5,
    "S": 6,
  }
  // FIXME: these will be supplied by the UW API,
  // but currently they are not available due to what likely is a bug on their end.
  TermStartDate = time.Date(2019, 9, 4, 0, 0, 0, 0, time.Local)
  TermEndDate = time.Date(2019, 12, 3, 0, 0, 0, 0, time.Local)
)

func WriteCalendar(w io.Writer, events []*WebcalEvent) {
	createTime := time.Now()

	io.WriteString(w, WebcalPreamble)
	// iCalendar spec (RFC 5545) requires timestamps in ISO 8601 format.
	// RFC 3339 is a stricter version of ISO 8601, thus acceptable.
	createTimeString := createTime.Format(time.RFC3339)
	for _, event := range events {
		startTimeString := event.StartTime.Format(time.RFC3339)
		endTimeString := event.EndTime.Format(time.RFC3339)
		fmt.Fprintf(
			w, WebcalEventTemplate,
			event.Summary, startTimeString, endTimeString, createTimeString, event.Location,
		)
	}
	io.WriteString(w, "END:VCALENDAR\n")
}

func ExtractUserEvents(state *state.State, userId int) ([]*PostgresEvent, error) {
  var events []*PostgresEvent
	rows, err := state.Conn.Query(
		`SELECT
      c.code, cs.section, c.name, sm.location,
      sm.start_date, sm.end_date, sm.start_seconds, sm.end_seconds, sm.days
     FROM
      user_schedule us
      JOIN course_section cs ON cs.id = us.section_id
      JOIN section_meeting sm ON sm.section_id = us.section_id
      JOIN course c ON c.id = cs.course_id
     WHERE
      us.user_id = $1
      AND sm.start_seconds IS NOT NULL
      AND sm.end_seconds IS NOT NULL`,
    userId,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var ev PostgresEvent
		err = rows.Scan(
			&ev.CourseCode, &ev.SectionName, &ev.CourseName, &ev.Location,
      &ev.StartDate, &ev.EndDate, &ev.StartSeconds, &ev.EndSeconds, &ev.Days,
		)
		if err != nil {
			return nil, err
		}
    events = append(events, &ev)
	}
	return events, nil
}

func PostgresToWebcalEvent(event *PostgresEvent) *WebcalEvent {
    summary := fmt.Sprintf(
      "%s - %s - %s",
      strings.ToUpper(event.CourseCode), event.SectionName, event.CourseName,
    )
    var location string
    if event.Location != nil {
      location = *event.Location
    } else {
      location = "Unknown"
    }
    return &WebcalEvent{
      Summary: summary,
      StartTime: event.StartDate.Add(time.Second * time.Duration(event.StartSeconds)),
      EndTime: event.StartDate.Add(time.Second * time.Duration(event.EndSeconds)),
      Location: location,
    }
}

func PostgresToWebcalEvents(postgresEvents []*PostgresEvent) ([]*WebcalEvent, error) {
  var webcalEvents []*WebcalEvent
  var recurringEvents [7][]*PostgresEvent

  for _, event := range postgresEvents {
    // Events without a start date are recurring.
    if event.StartDate == nil {
      for _, day := range event.Days {
        dayInt := DayMap[day]
        recurringEvents[dayInt] = append(recurringEvents[dayInt], event)
      }
      fmt.Println(recurringEvents)
      continue
    }

    // Otherwise, this is a one-time event.
    if !event.EndDate.Equal(*event.StartDate) {
      return nil, fmt.Errorf("one-time event start and end dates do not match: %v", event)
    }
    webcalEvents = append(webcalEvents, PostgresToWebcalEvent(event))
  }

  for date := TermStartDate; date.Before(TermEndDate); date = date.AddDate(0, 0, 1) {
    for _, event := range recurringEvents[int(date.Weekday())] {
      event.StartDate = &date
      webcalEvents = append(webcalEvents, PostgresToWebcalEvent(event))
    }
  }
  return webcalEvents, nil
}

func HandleWebcal(state *state.State, w http.ResponseWriter, r *http.Request) {
	userId, err := strconv.Atoi(chi.URLParam(r, "userId"))
	if err != nil {
    serde.Error(w, err.Error(), http.StatusBadRequest)
    return
	}
  events, err := ExtractUserEvents(state, userId)
  fmt.Println(events)
	if err != nil {
    serde.Error(w, err.Error(), http.StatusBadRequest)
    return
	}
  webcalEvents, err := PostgresToWebcalEvents(events)
	if err != nil {
    serde.Error(w, err.Error(), http.StatusBadRequest)
    return
	}
  w.Header().Set("Content-Type", "text/calendar")
  w.WriteHeader(http.StatusCreated)
  WriteCalendar(w, webcalEvents)
}
