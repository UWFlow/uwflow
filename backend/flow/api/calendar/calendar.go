package calendar

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"flow/api/serde"
	"flow/common/db"

	"github.com/go-chi/chi"
)

type postgresEvent struct {
	SectionId    int
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

type webcalEvent struct {
	// An identifier such that (groupid, timestamp) is globally unique.
	// For example, section ids have this property.
	GroupId   int
	Summary   string
	StartTime time.Time
	EndTime   time.Time
	Location  string
}

const timestampFormat = `20060102T150405Z`

const webcalPreamble = ("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n" +
	"METHOD:REQUEST\r\nPRODID:-//uwflow.com//%s//EN\r\n" +
	"X-WR-CALDESC:Schedule exported from https://uwflow.com\r\n" +
	"X-WR-CALNAME:UW Flow schedule\r\n")

const webcalEventTemplate = ("BEGIN:VEVENT\r\nSUMMARY:%s\r\n" +
	"UID:-//uwflow.com//%s//%04d//%d//EN\r\n" +
	"DTSTART:%s\r\nDTEND:%s\r\nDTSTAMP:%s\r\nLOCATION:%s\r\nEND:VEVENT\r\n")

var (
	dayToIndex = map[string]int{
		"Su": 0,
		"M":  1,
		"Tu": 2,
		"W":  3,
		"Th": 4,
		"F":  5,
		"S":  6,
	}
)

func writeCalendar(w io.Writer, secretId string, events []*webcalEvent) {
	createTime := time.Now()

	fmt.Fprintf(w, webcalPreamble, secretId)

	createTimeString := createTime.Format(timestampFormat)
	for _, event := range events {
		startTimeString := event.StartTime.Format(timestampFormat)
		endTimeString := event.EndTime.Format(timestampFormat)
		fmt.Fprintf(
			w, webcalEventTemplate,
			event.Summary, secretId, event.GroupId, event.StartTime.Unix(),
			startTimeString, endTimeString, createTimeString, event.Location,
		)
	}
	io.WriteString(w, "END:VCALENDAR\r\n")
}

const selectEventQuery = `
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
  src.section_id, c.code, cs.section_name, c.name, src.is_exam, src.location,
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

		err = rows.Scan(
			&ev.SectionId, &ev.CourseCode, &ev.SectionName, &ev.CourseName, &ev.IsExam, &ev.Location,
			&ev.StartDate, &ev.EndDate, &ev.StartSeconds, &ev.EndSeconds, &ev.Days,
		)
		if err != nil {
			return nil, fmt.Errorf("reading event row: %w", err)
		}

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
	if event.IsExam {
		summary = fmt.Sprintf("%s - FINAL", summary)
	} else {
		summary = fmt.Sprintf("%s - %s", summary, event.SectionName)
	}

	return &webcalEvent{
		GroupId:   event.SectionId,
		Summary:   summary,
		StartTime: date.Add(time.Second * time.Duration(event.StartSeconds)),
		EndTime:   date.Add(time.Second * time.Duration(event.EndSeconds)),
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

	w.Header().Set("Content-Disposition", "attachment; filename=uwflow.ics")
	w.Header().Set("Content-Type", `text/calendar; charset="utf-8"; method=REQUEST`)
	w.WriteHeader(http.StatusCreated)
	writeCalendar(w, secretId, webcalEvents)

	return nil
}
