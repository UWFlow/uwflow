package exam

import (
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/util"
)

var sectionNameRegexp = regexp.MustCompile(`\d+`)

func subjectNumberToCode(subjectNumber string) (string, error) {
	splits := strings.Split(subjectNumber, " ")
	if len(splits) != 2 {
		return "", fmt.Errorf("failed to separate subject and number: %s", subjectNumber)
	}
	return strings.ToLower(splits[0] + splits[1]), nil
}

func separateSectionNames(sectionString string) []string {
	matches := sectionNameRegexp.FindAllStringIndex(sectionString, -1)
	sections := make([]string, len(matches))
	for i, match := range matches {
		// All sections are lectures
		sections[i] = "LEC " + sectionString[match[0]:match[1]]
	}
	return sections
}

func Convert(apiExam *ApiExam, termId int) ([]Exam, error) {
	code, err := subjectNumberToCode(apiExam.CourseSubjectNumber)
	if err != nil {
		return nil, fmt.Errorf("failed to convert to course code: %w", err)
	}

	var exams []Exam
	for _, apiSection := range apiExam.Sections {
		sectionNames := separateSectionNames(apiSection.SectionName)
		for _, sectionName := range sectionNames {
			// Pointless to fill out if date and time are not set
			if apiSection.Date == "" || apiSection.StartTime == "" {
				exams = append(exams, Exam{
					CourseCode:  code,
					SectionName: sectionName,
					Term:        termId,
					IsTba:       true,
				})
				continue
			}

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

			exams = append(exams, Exam{
				CourseCode:   code,
				SectionName:  sectionName,
				Term:         termId,
				Location:     &apiSection.Location,
				StartSeconds: &startSeconds,
				EndSeconds:   &endSeconds,
				Date:         &date,
				Day:          &day,
				IsTba:        false,
			})
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
