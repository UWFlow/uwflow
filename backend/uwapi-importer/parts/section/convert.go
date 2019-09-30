package section

import (
	"fmt"
	"strings"
	"time"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/parts/term"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/util"
)

func ConvertSection(apiSection *ApiSection) *Section {
	return &Section{
		CourseCode:         strings.ToLower(apiSection.Subject + apiSection.CatalogNumber),
		ClassNumber:        apiSection.ClassNumber,
		SectionName:        apiSection.SectionName,
		Campus:             apiSection.Campus,
		EnrollmentCapacity: apiSection.EnrollmentCapacity,
		EnrollmentTotal:    apiSection.EnrollmentTotal,
		TermId:             apiSection.TermId,
	}
}

func ConvertMeeting(
	apiMeeting *ApiMeeting, section *Section, term *term.Term,
) (*Meeting, error) {
	var err error
	meeting := Meeting{
		SectionId:   section.Id,
		IsCancelled: apiMeeting.Date.IsCancelled,
		IsClosed:    apiMeeting.Date.IsClosed,
		IsTba:       apiMeeting.Date.IsTba,
	}

	// If instructor array is empty, keep ProfCode at nil
	if len(apiMeeting.Instructors) > 0 {
		// FIXME: it is not actually correct to discard instructors after 0th!
		// There exists at least one grad seminar with more than one instructor.
		// However, this does not happen with undergrad courses,
		// and having an array column of foreign keys is not possible.
		// This may well be a reasonable compromise in the end.
		code, err := util.ProfNameToCode(apiMeeting.Instructors[0])
		if err != nil {
			return nil, fmt.Errorf("failed to convert name: %w", err)
		}
		meeting.ProfCode = &code
	}

	if apiMeeting.Location.Building != nil && apiMeeting.Location.Room != nil {
		location := *apiMeeting.Location.Building + " " + *apiMeeting.Location.Room
		meeting.Location = &location
	}

	if apiMeeting.Date.StartTime != nil {
		startSeconds, err := util.TimeStringToSeconds(*apiMeeting.Date.StartTime)
		if err != nil {
			return nil, fmt.Errorf("failed to convert time: %w", err)
		}
		meeting.StartSeconds = &startSeconds
	}
	if apiMeeting.Date.EndTime != nil {
		endSeconds, err := util.TimeStringToSeconds(*apiMeeting.Date.EndTime)
		if err != nil {
			return nil, fmt.Errorf("failed to convert time: %w", err)
		}
		meeting.EndSeconds = &endSeconds
	}

	if apiMeeting.Date.StartDate != nil {
		// month/day (Go reference date is January 2nd)
		meeting.StartDate, err = time.Parse("01/02", *apiMeeting.Date.StartDate)
		if err != nil {
			return nil, fmt.Errorf("failed to convert date: %w", err)
		}
	} else {
		meeting.StartDate = term.StartDate
	}
	if apiMeeting.Date.EndDate != nil {
		// month/day (Go reference date is January 2nd)
		meeting.EndDate, err = time.Parse("01/02", *apiMeeting.Date.EndDate)
		if err != nil {
			return nil, fmt.Errorf("failed to convert date: %w", err)
		}
	} else {
		meeting.EndDate = term.EndDate
	}

	weekdays := apiMeeting.Date.Weekdays
	N := len(weekdays)
	for i := 0; i < N; i++ {
		// Day names are two characters iff the next char is lowercase
		if i+1 < N && 'a' <= weekdays[i+1] && weekdays[i+1] <= 'z' {
			meeting.Days = append(meeting.Days, weekdays[i:i+2])
		} else {
			meeting.Days = append(meeting.Days, weekdays[i:i+1])
		}
	}

	return &meeting, nil
}
