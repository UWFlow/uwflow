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

func separateSectionNames(sectionString string) []string {
	numbers := util.ExpandNumberRange(sectionString)
	sections := make([]string, len(numbers))
	for i, number := range numbers {
		// All sections are lectures
		sections[i] = fmt.Sprintf("LEC %03d", number)
	}
	return sections
}

func Convert(apiExam *ApiExam, termId int) ([]Exam, error) {
	code, err := subjectNumberToCode(apiExam.CourseSubjectNumber)
	if err != nil {
		return nil, fmt.Errorf("failed to convert to course code: %w", err)
	}

	var exams []Exam
	var currentExam Exam
	for _, apiSection := range apiExam.Sections {
		// Pointless to fill out if date and time are not set
		if apiSection.Date == "" || apiSection.StartTime == "" {
			currentExam = Exam{
				CourseCode: code,
				Term:       termId,
				IsTba:      true,
			}
		} else {
			date, err := time.Parse("2006-01-02", apiSection.Date)
			if err != nil {
				return nil, fmt.Errorf("failed to convert date: %w", err)
			}
			day := util.DateToWeekdayCode(date)
			startSeconds, err := util.TimeString12HToSeconds(apiSection.StartTime)
			if err != nil {
				return nil, fmt.Errorf("failed to convert time: %w", err)
			}
			endSeconds, err := util.TimeString12HToSeconds(apiSection.EndTime)
			if err != nil {
				return nil, fmt.Errorf("failed to convert time: %w", err)
			}
			// &apiSection.Location will change as apiSection is swapped in-place
			location := apiSection.Location
			currentExam = Exam{
				CourseCode:   code,
				Term:         termId,
				Location:     &location,
				StartSeconds: &startSeconds,
				EndSeconds:   &endSeconds,
				Date:         &date,
				Day:          &day,
				IsTba:        false,
			}
		}

		sectionNames := separateSectionNames(apiSection.SectionName)
		for _, sectionName := range sectionNames {
			currentExam.SectionName = sectionName
			exams = append(exams, currentExam)
		}
	}
	return exams, nil
}

func ConvertByTerm(apiExams []ApiExam, termId int) ([]Exam, error) {
	var exams []Exam
	for _, apiExam := range apiExams {
		newExams, err := Convert(&apiExam, termId)
		if err != nil {
			return nil, err
		}
		exams = append(exams, newExams...)
	}
	return exams, nil
}
