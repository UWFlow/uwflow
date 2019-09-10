package webcal

import (
	"fmt"
	"io"
  "net/http"
	"time"
  "strconv"

	"github.com/go-chi/chi"
	"github.com/AyushK1/uwflow2.0/backend/api/serde"
	"github.com/AyushK1/uwflow2.0/backend/api/state"
)

type PostgresEvent struct {
  CourseCode string
  Section string
  CourseName string
  StartDate *time.Time
  EndDate *time.Time
  StartSeconds *int
  EndSeconds *int
  Location *string
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

func WriteCalendar(w io.Writer, events []*WebcalEvent) error {
	createTime := time.Now()

	io.WriteString(w, WebcalPreamble)
	// iCalendar spec (RFC 5545) requires timestamps in ISO 8601 format.
	// RFC 3339 is a stricter version of ISO 8601, thus acceptable.
	createTimeString := createTime.Format(time.RFC3339)
	for _, event := range events {
		startTimeString := event.StartTime.Format(time.RFC3339)
		endTimeString := event.StartTime.Format(time.RFC3339)
		fmt.Fprintf(
			w, WebcalEventTemplate,
			event.Summary, startTimeString, endTimeString, createTimeString, event.Location,
		)
	}
	io.WriteString(w, "END:VCALENDAR\n")
	return nil
}

func ExtractUserEvents(state *state.State, userId int) ([]*WebcalEvent, error) {
  rows, err := state.Conn.Query(
    `SELECT
      c.code,
      cs.section,
      c.name,
      sm.start_date,
      sm.end_date,
      sm.start_seconds,
      sm.end_seconds,
      sm.location
     FROM
      user_schedule us
      JOIN course_section cs ON cs.class_number = us.class_number
      JOIN section_meeting sm ON sm.class_number = us.class_number
      JOIN course c ON c.id = cs.course_id`,
  )
  if err != nil {
    return nil, err
  }
  defer rows.Close()

  for rows.Next() {
    var ev PostgresEvent
    err = rows.Scan(
      &ev.CourseCode, &ev.Section, &ev.CourseName, &ev.StartDate, &ev.EndDate,
      &ev.StartSeconds, &ev.EndSeconds, &ev.Location,
    )
    if err != nil {
      return nil, err
    }
    fmt.Println(ev)
  }
  return nil, nil
}

func HandleWebcal(state *state.State, w http.ResponseWriter, r *http.Request) {
  userId, err := strconv.Atoi(chi.URLParam(r, "userId"))
  if err != nil {
    serde.Error(w, err.Error(), http.StatusBadRequest)
  }
  _, err = ExtractUserEvents(state, userId)
  if err != nil {
    serde.Error(w, err.Error(), http.StatusBadRequest)
  }
  w.WriteHeader(http.StatusOK)
}
