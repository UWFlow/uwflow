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
	// Grades[i] is the grade for Courses[i]: a mark like 87 or a code like CR.
	// It is empty for courses that are still in progress.
	Grades []string
	// TermGPA and CumulativeGPA are percentages as printed, like 91.60.
	// They are empty for terms that are still in progress.
	TermGPA       string
	CumulativeGPA string
}

type Summary struct {
	StudentNumber int
	ProgramName   string
	TermSummaries []TermSummary
}

var (
	// We have at least two letters in the department name, then whitespace,
	// then the course number in [1, 1000) potentially with letters at the end.
	// Why trailing whitespace and the strict requirement of at least two
	// characters that are exactly 0x20? This whitespace must be column padding.
	// This distinguishes courses in the taken table from courses in the notes
	// (e.g. course equivalences established during program transfer)
	courseRegexp = regexp.MustCompile(`([A-Z]{2,})\x20{2,}(\d{1,3}\w*)\x20{2,}.*\n`)
	creditRegexp = regexp.MustCompile(`\d.\d{2}`)
	// Level may contain more than two letters or numbers.
	levelRegexp         = regexp.MustCompile(`Level:\s+(\w{2,})`)
	studentIdRegexp     = regexp.MustCompile(`Student ID:\s+(\d+)`)
	termGPARegexp       = regexp.MustCompile(`Term GPA\s+(\d+\.\d{2})`)
	cumulativeGPARegexp = regexp.MustCompile(`Cumulative GPA\s+(\d+\.\d{2})`)
	// Term names may show up in transcript comments which should be ignored.
	// We only want terms that show up on their own line.
	termRegexp = regexp.MustCompile(`(?m)^\s*(Fall|Winter|Spring)\s+(\d{4})\s*$`)
)

// courseLine is of one of the following forms:
//
// ECON   102    Macroeconomics   0.50    0.50   98
// ECON   102    Macroeconomics
// ECON   102    Macroeconomics   0.50
//
// Those are, in order: past term course, current term course, transfer credit.
// isTransferCredit should return true only for the last case.
func isTransferCredit(courseLine string) bool {
	matches := creditRegexp.FindAllString(courseLine, -1)
	return len(matches) == 1
}

// extractGrade returns the last column of a past term courseLine,
// or "" if the course has no grade yet.
func extractGrade(courseLine string) string {
	if len(creditRegexp.FindAllString(courseLine, -1)) != 2 {
		return ""
	}
	fields := strings.Fields(courseLine)
	grade := fields[len(fields)-1]
	if creditRegexp.MatchString(grade) {
		return ""
	}
	return grade
}

// findInSpan returns the first submatch of re within text[start:end], or "".
func findInSpan(re *regexp.Regexp, text string, start, end int) string {
	match := re.FindStringSubmatch(text[start:end])
	if match == nil {
		return ""
	}
	return match[1]
}

func extractTermSummaries(text string) ([]TermSummary, error) {
	// Passing -1 means setting no upper limit on number of matches
	terms := termRegexp.FindAllStringSubmatchIndex(text, -1)
	levels := levelRegexp.FindAllStringSubmatchIndex(text, -1)
	courses := courseRegexp.FindAllStringSubmatchIndex(text, -1)
	if len(terms) != len(levels) {
		return nil, fmt.Errorf("some terms lack academic level")
	}
	history := make([]TermSummary, len(terms))
	for i, j := 0, 0; i < len(terms); i++ {
		season := text[terms[i][2]:terms[i][3]]
		year := text[terms[i][4]:terms[i][5]]
		term, err := util.TermSeasonYearToId(season, year)
		if err != nil {
			return nil, fmt.Errorf(`"%s %s" is not a term: %w`, season, year, err)
		}
		history[i].TermId = term
		history[i].Level = text[levels[i][2]:levels[i][3]]
		end := len(text)
		if i < len(terms)-1 {
			end = terms[i+1][0]
		}
		history[i].TermGPA = findInSpan(termGPARegexp, text, terms[i][0], end)
		history[i].CumulativeGPA = findInSpan(cumulativeGPARegexp, text, terms[i][0], end)
		// Include courses that come before next term's heading
		// except for the last term, which includes all remaining courses.
		for ; j < len(courses) && (i == len(terms)-1 || courses[j][0] < terms[i+1][0]); j++ {
			// Some courses are transfer (AP/IB) credits.
			// They were not taken at UW, so should not be imported.
			courseLine := text[courses[j][0]:courses[j][1]]
			if isTransferCredit(courseLine) {
				continue
			}
			department := text[courses[j][2]:courses[j][3]]
			number := text[courses[j][4]:courses[j][5]]
			history[i].Courses = append(
				history[i].Courses,
				strings.ToLower(department+number),
			)
			history[i].Grades = append(history[i].Grades, extractGrade(courseLine))
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
	submatches := studentIdRegexp.FindStringSubmatchIndex(text)
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
