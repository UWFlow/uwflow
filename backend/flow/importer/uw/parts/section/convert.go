package section

import (
	"fmt"
	"strings"

	"flow/common/util"
	"flow/importer/uw/parts/term"
)

func ConvertAll(dst *ConvertResult, apiSections []ApiSection, term *term.Term) error {
	for _, apiSection := range apiSections {
		err := ConvertSection(dst, &apiSection, term)
		if err != nil {
			return fmt.Errorf("failed to convert section: %w", err)
		}
	}
	return nil
}

func ConvertSection(dst *ConvertResult, apiSection *ApiSection, term *term.Term) error {
	code := strings.ToLower(apiSection.Subject + apiSection.CatalogNumber)
	dst.Sections = append(
		dst.Sections,
		Section{
			CourseCode:         code,
			ClassNumber:        apiSection.ClassNumber,
			SectionName:        apiSection.SectionName,
			Campus:             apiSection.Campus,
			EnrollmentCapacity: apiSection.EnrollmentCapacity,
			EnrollmentTotal:    apiSection.EnrollmentTotal,
			TermId:             apiSection.TermId,
		},
	)

	for _, apiMeeting := range apiSection.Meetings {
		err := ConvertMeeting(dst, apiSection, &apiMeeting, term)
		if err != nil {
			return fmt.Errorf("failed to convert meeting: %w", err)
		}
	}

	return nil
}

func ConvertMeeting(
	dst *ConvertResult, apiSection *ApiSection, apiMeeting *ApiMeeting, term *term.Term,
) error {
	dst.Meetings = append(
		dst.Meetings,
		Meeting{
			ClassNumber: apiSection.ClassNumber,
			TermId:      apiSection.TermId,
			Days:        make([]string, 0),
			IsCancelled: apiMeeting.Date.IsCancelled,
			IsClosed:    apiMeeting.Date.IsClosed,
			IsTba:       apiMeeting.Date.IsTba,
		},
	)
	meeting := &dst.Meetings[len(dst.Meetings)-1]

	// If instructor array is empty, keep ProfCode at nil
	if len(apiMeeting.Instructors) > 0 {
		// FIXME: it is not actually correct to discard instructors after 0th!
		// There exists at least one grad seminar with more than one instructor.
		// However, this does not happen with undergrad courses,
		// and having an array column of foreign keys is not possible.
		// This may well be a reasonable compromise in the end.
		name, err := util.LastFirstToFirstLast(apiMeeting.Instructors[0])
		if err != nil {
			return fmt.Errorf("failed to convert name: %w", err)
		}
		code := util.ProfNameToCode(name)
		meeting.ProfCode = &code
		dst.Profs = append(dst.Profs, Prof{Name: name, Code: code})
	}

	if apiMeeting.Location.Building != nil && apiMeeting.Location.Room != nil {
		location := *apiMeeting.Location.Building + " " + *apiMeeting.Location.Room
		meeting.Location = &location
	}

	if apiMeeting.Date.StartTime != nil {
		startSeconds, err := util.TimeString24HToSeconds(*apiMeeting.Date.StartTime)
		if err != nil {
			return fmt.Errorf("failed to convert time: %w", err)
		}
		meeting.StartSeconds = &startSeconds
	}
	if apiMeeting.Date.EndTime != nil {
		endSeconds, err := util.TimeString24HToSeconds(*apiMeeting.Date.EndTime)
		if err != nil {
			return fmt.Errorf("failed to convert time: %w", err)
		}
		meeting.EndSeconds = &endSeconds
	}

	var err error
	if apiMeeting.Date.StartDate != nil {
		meeting.StartDate, err = util.MonthDayToDate(*apiMeeting.Date.StartDate, term.Id)
		if err != nil {
			return fmt.Errorf("failed to convert date: %w", err)
		}
	} else {
		meeting.StartDate = term.StartDate
	}
	if apiMeeting.Date.EndDate != nil {
		meeting.EndDate, err = util.MonthDayToDate(*apiMeeting.Date.StartDate, term.Id)
		if err != nil {
			return fmt.Errorf("failed to convert date: %w", err)
		}
	} else {
		meeting.EndDate = term.EndDate
	}

  meeting.Days = util.SplitWeekdayString(apiMeeting.Date.Weekdays)

	return nil
}
