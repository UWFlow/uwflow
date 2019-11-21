package webcal

import (
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"flow/api/serde"
	"flow/common/state"

	"github.com/go-chi/chi"
)

type PostgresEvent struct {
	CourseCode   string
	SectionName  string
	CourseName   string
	IsExam       bool
	Location     *string
	StartDate    time.Time
	EndDate      time.Time
	StartSeconds int
	EndSeconds   int
	Days         []string
	// HasDay[x] is true if event occurs on weekday x
	HasDay [7]bool
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
	DayToIndex = map[string]int{
		"Su": 0,
		"M":  1,
		"Tu": 2,
		"W":  3,
		"Th": 4,
		"F":  5,
		"S":  6,
	}
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

const SelectEventQuery = `
WITH src AS (
  SELECT
    FALSE as is_exam, section_id, location, start_date, end_date,
    start_seconds, end_seconds, days
  FROM section_meeting
  UNION ALL
  SELECT
    TRUE AS is_exam, section_id, location, date, date,
    start_seconds, end_seconds, ARRAY[day]
  FROM section_exam
)
SELECT
  c.code, cs.section, c.name, src.is_exam, src.location,
  src.start_date, src.end_date, src.start_seconds, src.end_seconds, src.days
FROM
  user_schedule us
  JOIN course_section cs ON cs.id = us.section_id
  JOIN src ON src.section_id = us.section_id
  JOIN course c ON c.id = cs.course_id
WHERE us.user_id = $1
	-- Fetch meetings where start_seconds and end_seconds are present.
	-- Otherwise, we cannot say anything useful about when they take place.
  AND src.start_seconds IS NOT NULL
  AND src.end_seconds IS NOT NULL
`

func ExtractUserEvents(state *state.State, userId int) ([]*PostgresEvent, error) {
	var events []*PostgresEvent
	rows, err := state.Db.Query(SelectEventQuery, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var ev PostgresEvent

		err = rows.Scan(
			&ev.CourseCode, &ev.SectionName, &ev.CourseName, &ev.IsExam, &ev.Location,
			&ev.StartDate, &ev.EndDate, &ev.StartSeconds, &ev.EndSeconds, &ev.Days,
		)
		if err != nil {
			return nil, err
		}

		for _, day := range ev.Days {
			ev.HasDay[DayToIndex[day]] = true
		}

		events = append(events, &ev)
	}
	return events, nil
}

func PostgresToWebcalEvent(event *PostgresEvent, date time.Time) *WebcalEvent {
	var location string
	if event.Location != nil {
		location = *event.Location
	} else {
		location = "Unknown"
	}
	summary := fmt.Sprintf(
		"%s - %s - %s",
		strings.ToUpper(event.CourseCode), event.SectionName, event.CourseName,
	)
	if event.IsExam {
		summary = "Final exam for " + summary
	}
	return &WebcalEvent{
		Summary:   summary,
		StartTime: date.Add(time.Second * time.Duration(event.StartSeconds)),
		EndTime:   date.Add(time.Second * time.Duration(event.EndSeconds)),
		Location:  location,
	}
}

func PostgresToWebcalEvents(state *state.State, events []*PostgresEvent) ([]*WebcalEvent, error) {
	var webcalEvents []*WebcalEvent

	for _, event := range events {
		// Walk entire date range for each event. It would be more efficient
		// to map days to events and walk the union of date ranges for all events simultaneously,
		// but this is so fast as-is that the difference is negligible.
		for date := event.StartDate; !date.After(event.EndDate); date = date.AddDate(0, 0, 1) {
			if event.HasDay[int(date.Weekday())] {
				webcalEvents = append(webcalEvents, PostgresToWebcalEvent(event, date))
			}
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
	if err != nil {
		serde.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	webcalEvents, err := PostgresToWebcalEvents(state, events)
	if err != nil {
		serde.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "text/calendar")
	w.WriteHeader(http.StatusCreated)
	WriteCalendar(w, webcalEvents)
}
