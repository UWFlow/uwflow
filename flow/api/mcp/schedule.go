package mcp

import (
	"encoding/json"
	"fmt"
	"sort"
	"strings"
	"time"
)

// Ported from frontend/src/pages/coursePage/CourseSchedule.tsx and
// frontend/src/utils/Schedule.ts.

// sectionCodes is SECTION_CODES (constants/CourseSection.tsx): the order
// section types appear in a schedule.
var sectionCodes = []string{
	"LEC", "OLN", "RDG", "CLN", "DIS", "ORL", "SEM", "ESS", "FLD", "FLT",
	"LAB", "PRA", "PRJ", "STU", "WRK", "WSP", "TUT", "ENS", "TST",
}

func sectionOrder(name string) int {
	kind, _, _ := strings.Cut(name, " ")
	for i, code := range sectionCodes {
		if code == kind {
			return i
		}
	}
	return len(sectionCodes) // unknown types last; the page's comparator returns NaN
}

var weekDayLetters = []string{"M", "T", "W", "Th", "F", "S", "Su"}

func dayIndex(day string) int {
	for i, d := range weekDayLetters {
		if d == day {
			return i
		}
	}
	return -1
}

// termsOffered returns the course's terms newest first, as the page's tabs.
func termsOffered(sections []section) []int {
	var terms []int
	for _, s := range sections {
		if !contains(terms, s.TermID) {
			terms = append(terms, s.TermID)
		}
	}
	sort.Sort(sort.Reverse(sort.IntSlice(terms)))
	return terms
}

// defaultTerm mirrors getStartingTab: the first term (newest first) whose
// start is strictly within two months of now, else the newest.
func defaultTerm(terms []int, now time.Time) int {
	for _, t := range terms {
		start := termStart(t)
		if now.After(start.AddDate(0, -2, 0)) && now.Before(start.AddDate(0, 2, 0)) {
			return t
		}
	}
	return terms[0]
}

// mergeMeetingDateRanges mirrors utils/Schedule.ts: rows that differ only in
// their active dates collapse into one spanning the earliest start and the
// latest end.
func mergeMeetingDateRanges(meetings []meeting) []meeting {
	var order []string
	merged := map[string]meeting{}
	for _, m := range meetings {
		key := meetingKey(m)
		existing, ok := merged[key]
		if !ok {
			order = append(order, key)
			merged[key] = m
			continue
		}
		if m.StartDate < existing.StartDate {
			existing.StartDate = m.StartDate
		}
		if m.EndDate > existing.EndDate {
			existing.EndDate = m.EndDate
		}
		merged[key] = existing
	}
	out := make([]meeting, 0, len(order))
	for _, key := range order {
		out = append(out, merged[key])
	}
	return out
}

func meetingKey(m meeting) string {
	days := append([]string(nil), m.Days...)
	sort.Strings(days)
	var profID *int
	if m.Prof != nil {
		profID = &m.Prof.ID
	}
	key, _ := json.Marshal([]any{days, m.StartSeconds, m.EndSeconds, m.Location, profID, m.IsClosed, m.IsCancelled, m.IsTba})
	return string(key)
}

type dateRange struct {
	Days      []string `json:"days" jsonschema:"weekdays as M T W Th F S Su"`
	StartDate string   `json:"start_date"`
	EndDate   string   `json:"end_date"`
}

type meetingGroup struct {
	Time       string      `json:"time" jsonschema:"start and end time, or TBA"`
	Location   string      `json:"location,omitempty" jsonschema:"room; the website does not show this column"`
	Instructor string      `json:"instructor,omitempty" jsonschema:"instructor name; the website does not show this column"`
	ProfCode   string      `json:"prof_code,omitempty"`
	Cancelled  bool        `json:"cancelled"`
	TBA        bool        `json:"tba"`
	Dates      []dateRange `json:"dates"`
}

// groupMeetings mirrors getInfoGroupings: one group per time of day, taking
// location, instructor and status from its first meeting. Date ranges are
// sorted by date before same-range days are joined; the page subtracts date
// strings (NaN) and so leaves them unsorted.
func groupMeetings(meetings []meeting) []meetingGroup {
	type group struct {
		meetingGroup
		ranges []dateRange
	}
	var order []string
	groups := map[string]*group{}
	for _, m := range mergeMeetingDateRanges(meetings) {
		key := fmt.Sprintf("%d %d", orZero(m.StartSeconds), orZero(m.EndSeconds))
		g, ok := groups[key]
		if !ok {
			g = &group{meetingGroup: meetingGroup{
				Time:      clockTime(orZero(m.StartSeconds)) + " - " + clockTime(orZero(m.EndSeconds)),
				Location:  deref(m.Location),
				Cancelled: m.IsCancelled,
				TBA:       m.IsTba,
			}}
			if m.Prof != nil && m.Prof.Code != nil && *m.Prof.Code != "" {
				g.Instructor, g.ProfCode = m.Prof.Name, *m.Prof.Code
			}
			if m.IsTba {
				g.Time = "TBA"
			}
			groups[key] = g
			order = append(order, key)
		}
		g.ranges = append(g.ranges, dateRange{Days: m.Days, StartDate: m.StartDate, EndDate: m.EndDate})
	}

	out := make([]meetingGroup, 0, len(order))
	for _, key := range order {
		g := groups[key]
		sort.SliceStable(g.ranges, func(i, j int) bool { return g.ranges[i].StartDate < g.ranges[j].StartDate })
		var days []string
		for i, r := range g.ranges {
			for _, d := range r.Days {
				if dayIndex(d) >= 0 && !containsString(days, d) {
					days = append(days, d)
				}
			}
			if i+1 < len(g.ranges) && r.StartDate == g.ranges[i+1].StartDate && r.EndDate == g.ranges[i+1].EndDate {
				continue
			}
			sort.SliceStable(days, func(a, b int) bool { return dayIndex(days[a]) < dayIndex(days[b]) })
			g.Dates = append(g.Dates, dateRange{Days: days, StartDate: r.StartDate, EndDate: r.EndDate})
			days = nil
		}
		out = append(out, g.meetingGroup)
	}
	return out
}

func containsString(list []string, v string) bool {
	for _, x := range list {
		if x == v {
			return true
		}
	}
	return false
}

type examInfo struct {
	Date     string `json:"date,omitempty"`
	Day      string `json:"day,omitempty"`
	Time     string `json:"time,omitempty"`
	Location string `json:"location,omitempty"`
	TBA      bool   `json:"tba"`
}

type sectionInfo struct {
	Section     string         `json:"section" jsonschema:"section type and number, e.g. LEC 001"`
	ClassNumber int            `json:"class_number"`
	Enrolled    int            `json:"enrolled"`
	Capacity    int            `json:"capacity"`
	Full        bool           `json:"full"`
	Meetings    []meetingGroup `json:"meetings"`
	Exams       []examInfo     `json:"exams,omitempty" jsonschema:"exam times; fetched by the website but not shown on the course page"`
	UpdatedAt   string         `json:"updated_at"`
}

// termSections mirrors sectionsCleanedData: one term's sections, ordered by
// section type then name. Cancellation is reported per meeting group; the
// page greys out every section in a term when any meeting is cancelled.
func termSections(sections []section, term int) []sectionInfo {
	var out []sectionInfo
	for _, s := range sections {
		if s.TermID != term {
			continue
		}
		info := sectionInfo{
			Section:     s.SectionName,
			ClassNumber: s.ClassNumber,
			Enrolled:    s.EnrollmentTotal,
			Capacity:    s.EnrollmentCapacity,
			Full:        s.EnrollmentTotal >= s.EnrollmentCapacity,
			Meetings:    groupMeetings(s.Meetings),
			UpdatedAt:   s.UpdatedAt,
		}
		for _, e := range s.Exams {
			x := examInfo{Date: deref(e.Date), Day: deref(e.Day), Location: deref(e.Location), TBA: e.IsTba}
			if e.StartSeconds != nil && e.EndSeconds != nil {
				x.Time = clockTime(*e.StartSeconds) + " - " + clockTime(*e.EndSeconds)
			}
			info.Exams = append(info.Exams, x)
		}
		out = append(out, info)
	}
	sort.SliceStable(out, func(i, j int) bool {
		a, b := sectionOrder(out[i].Section), sectionOrder(out[j].Section)
		if a != b {
			return a < b
		}
		return out[i].Section < out[j].Section
	})
	return out
}
