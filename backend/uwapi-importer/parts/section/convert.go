package section

import (
	"fmt"
	"strings"
	"time"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/parts/term"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/util"
)

func ConvertAll(
	apiSections []ApiSection, term *term.Term,
) ([]Section, []Meeting, []Prof, error) {
	sections := make([]Section, len(apiSections))
	meetings := make([]Meeting, 0, len(apiSections))
	profs := make([]Prof, 0, len(apiSections))
	seenProfCodes := make(map[string]bool)

	for i, apiSection := range apiSections {
		section, curMeetings, curProfs, err := Convert(&apiSection, term)
		if err != nil {
			return nil, nil, nil, fmt.Errorf("failed to convert section: %w", err)
		}
		sections[i] = *section
		meetings = append(meetings, curMeetings...)
		for _, prof := range curProfs {
			if !seenProfCodes[prof.Code] {
				profs = append(profs, prof)
				seenProfCodes[prof.Code] = true
			}
		}
	}
	return sections, meetings, profs, nil
}

func Convert(
	apiSection *ApiSection, term *term.Term,
) (*Section, []Meeting, []Prof, error) {
	code := strings.ToLower(apiSection.Subject + apiSection.CatalogNumber)
	section := &Section{
		CourseCode:         code,
		ClassNumber:        apiSection.ClassNumber,
		SectionName:        apiSection.SectionName,
		Campus:             apiSection.Campus,
		EnrollmentCapacity: apiSection.EnrollmentCapacity,
		EnrollmentTotal:    apiSection.EnrollmentTotal,
		TermId:             apiSection.TermId,
	}

	var profs []Prof
	meetings := make([]Meeting, len(apiSection.Meetings))
	for i, apiMeeting := range apiSection.Meetings {
		meeting, prof, err := convertMeeting(&apiMeeting, section, term)
		meetings[i] = *meeting
		if err != nil {
			return nil, nil, nil, fmt.Errorf("failed to convert meeting: %w", err)
		}
		if prof != nil {
			profs = append(profs, *prof)
		}
	}

	return section, meetings, profs, nil
}

func convertMeeting(
	apiMeeting *ApiMeeting, section *Section, term *term.Term,
) (*Meeting, *Prof, error) {
	var err error
	var prof *Prof
	meeting := &Meeting{
		ClassNumber: section.ClassNumber,
		TermId:      section.TermId,
		Days:        make([]string, 0),
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
		name, err := util.LastFirstToFirstLast(apiMeeting.Instructors[0])
		if err != nil {
			return nil, nil, fmt.Errorf("failed to convert name: %w", err)
		}
		code := util.ProfNameToCode(name)
		meeting.ProfCode = &code
		prof = &Prof{Name: name, Code: code}
	}

	if apiMeeting.Location.Building != nil && apiMeeting.Location.Room != nil {
		location := *apiMeeting.Location.Building + " " + *apiMeeting.Location.Room
		meeting.Location = &location
	}

	if apiMeeting.Date.StartTime != nil {
		startSeconds, err := util.TimeStringToSeconds(*apiMeeting.Date.StartTime)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to convert time: %w", err)
		}
		meeting.StartSeconds = &startSeconds
	}
	if apiMeeting.Date.EndTime != nil {
		endSeconds, err := util.TimeStringToSeconds(*apiMeeting.Date.EndTime)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to convert time: %w", err)
		}
		meeting.EndSeconds = &endSeconds
	}

	if apiMeeting.Date.StartDate != nil {
		// month/day (Go reference date is January 2nd)
		meeting.StartDate, err = time.Parse("01/02", *apiMeeting.Date.StartDate)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to convert date: %w", err)
		}
	} else {
		meeting.StartDate = term.StartDate
	}
	if apiMeeting.Date.EndDate != nil {
		// month/day (Go reference date is January 2nd)
		meeting.EndDate, err = time.Parse("01/02", *apiMeeting.Date.EndDate)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to convert date: %w", err)
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

	return meeting, prof, nil
}
