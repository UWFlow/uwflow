package exam

import (
	"fmt"
	"strings"
	"time"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/util"
)

func subjectNumberToCode(subjectNumber string) (string, error) {
	splits := strings.Split(subjectNumber, " ")
	if len(splits) != 2 {
		return "", fmt.Errorf("failed to separate subject and number: %s", subjectNumber)
	}
	return strings.ToLower(splits[0] + splits[1]), nil
}

func Convert(apiExam *ApiExam, termId int) ([]Exam, error) {
	code, err := subjectNumberToCode(apiExam.CourseSubjectNumber)
	if err != nil {
		return nil, fmt.Errorf("failed to convert to course code: %w", err)
	}

	exams := make([]Exam, len(apiExam.Sections))
	for i, apiSection := range apiExam.Sections {
		exams[i] = Exam{
			CourseCode:     code,
			Term:           termId,
			LectureSection: apiSection.LectureSection,
		}
		// Pointless to fill out if date and time are not set
		if apiSection.Date == "" || apiSection.StartTime == "" {
			exams[i].IsTba = true
			continue
		}

		date, err := time.Parse("2006-01-02", apiSection.Date)
		if err != nil {
			return nil, fmt.Errorf("failed to convert date: %w", err)
		}
		_ = util.DateToWeekdayCode(date)
		exams[i].StartSeconds, err = util.TimeString12HToSeconds(apiSection.StartTime)
		if err != nil {
			return nil, fmt.Errorf("failed to convert time: %w", err)
		}
		exams[i].EndSeconds, err = util.TimeString12HToSeconds(apiSection.EndTime)
		if err != nil {
			return nil, fmt.Errorf("failed to convert time: %w", err)
		}
	}
	return exams, nil
}
