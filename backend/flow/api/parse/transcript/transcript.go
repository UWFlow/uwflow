package transcript

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"flow/common/util"
)

type TermSummary struct {
	// Term ids are numbers of the form 1189 (Fall 2018)
	TermId int
	// Levels are similar to 1A, 5C (delayed graduation).
	Level string
	// Course codes are similar to CS 145, STAT 920, PD 1, CHINA 120R.
	Courses []string
}

func (ts TermSummary) Equals(other TermSummary) bool {
	if ts.TermId != other.TermId || ts.Level != other.Level {
		return false
	}
	for i, course := range ts.Courses {
		if course != other.Courses[i] {
			return false
		}
	}
	return true
}

type Summary struct {
	StudentNumber int
	ProgramName   string
	TermSummaries []TermSummary
}

func (ts Summary) Equals(other Summary) bool {
	if ts.StudentNumber != other.StudentNumber || ts.ProgramName != other.ProgramName {
		return false
	}
	if len(ts.TermSummaries) != len(other.TermSummaries) {
		return false
	}
	for i, summary := range ts.TermSummaries {
		if !summary.Equals(other.TermSummaries[i]) {
			return false
		}
	}
	return true
}

var (
	// We have at least two letters in the department name, then whitespace,
	// then the course number in [1, 1000) potentially with letters at the end.
	CourseRegexp    = regexp.MustCompile(`([A-Z]{2,})\s+(\d{1,3}\w?)\s`)
	LevelRegexp     = regexp.MustCompile(`Level:\s+(\d\w)`)
	StudentIdRegexp = regexp.MustCompile(`Student ID:\s+(\d+)`)
	TermRegexp      = regexp.MustCompile(`(Fall|Winter|Spring)\s+(\d{4})`)
)

func extractTermSummaries(text string) ([]TermSummary, error) {
	// Passing -1 means setting no upper limit on number of matches
	terms := TermRegexp.FindAllStringSubmatchIndex(text, -1)
	levels := LevelRegexp.FindAllStringSubmatchIndex(text, -1)
	courses := CourseRegexp.FindAllStringSubmatchIndex(text, -1)
	if len(terms) != len(levels) {
		return nil, fmt.Errorf("some terms lack academic level")
	}
	history := make([]TermSummary, len(terms))
	for i, j := 0, 0; i < len(terms); i++ {
		season := text[terms[i][2]:terms[i][3]]
		year := text[terms[i][4]:terms[i][5]]
		term, err := util.TermSeasonYearToId(season, year)
		if err != nil {
			return nil, fmt.Errorf("\"%s %s\" is not a term: %w", season, year, err)
		}
		history[i].TermId = term
		history[i].Level = text[levels[i][2]:levels[i][3]]
		// Pre-allocate: average student should have about 5 courses per term
		history[i].Courses = make([]string, 0, 5)
		// Include courses that come before next term's heading
		// except for the last term, which includes all remaining courses.
		for ; j < len(courses) && (i == len(terms)-1 || courses[j][0] < terms[i+1][0]); j++ {
			department := text[courses[j][2]:courses[j][3]]
			number := text[courses[j][4]:courses[j][5]]
			history[i].Courses = append(
				history[i].Courses,
				strings.ToLower(department+number),
			)
		}
	}
	return history, nil
}

func extractProgramName(text string) (string, error) {
	start := strings.LastIndex(text, "Program:")
	if start == -1 {
		return "", fmt.Errorf("program name not found")
	}
	start += 8 // skip "Program:"

	for end := start; end < len(text); end++ {
		if text[end] == ',' || text[end] == '\n' {
			return strings.TrimSpace(text[start:end]), nil
		}
	}
	return "", fmt.Errorf("unexpected end of transcript")
}

func Parse(text string) (*Summary, error) {
	submatches := StudentIdRegexp.FindStringSubmatchIndex(text)
	if submatches == nil {
		return nil, fmt.Errorf("student id not found")
	}
	studentNumber, err := strconv.Atoi(text[submatches[2]:submatches[3]])
	if err != nil {
		return nil, fmt.Errorf("student number not an int: %w", err)
	}

	programName, err := extractProgramName(text)
	if err != nil {
		return nil, fmt.Errorf("extracting program name: %w", err)
	}

	termSummaries, err := extractTermSummaries(text)
	if err != nil {
		return nil, fmt.Errorf("extracting term summaries: %w", err)
	}

	result := &Summary{
		StudentNumber: studentNumber,
		ProgramName:   programName,
		TermSummaries: termSummaries,
	}
	return result, nil
}
