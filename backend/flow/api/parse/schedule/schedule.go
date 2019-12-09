package schedule

import (
	"fmt"
	"regexp"
	"strconv"

	"flow/common/util"
)

type ScheduleSummary struct {
	// Terms are numbers of the form 1189 (Fall 2018)
	Term int
	// Class numbers are four digits (e.g. 4895)
	// and uniquely identify a section of a course within a term.
	ClassNumbers []int
}

func (ts ScheduleSummary) Equals(other ScheduleSummary) bool {
	if ts.Term != other.Term || len(ts.ClassNumbers) != len(other.ClassNumbers) {
		return false
	}
	for i, classNumber := range ts.ClassNumbers {
		if classNumber != other.ClassNumbers[i] {
			return false
		}
	}
	return true
}

var (
	TermRegexp = regexp.MustCompile(`(Spring|Fall|Winter)\s+(\d{4})`)
	// Class numbers are *the* four-digit sequences
	// which occur on a separate line, perhaps parenthesized.
	ClassNumberRegexp = regexp.MustCompile(`\n\(?(\d{4})\)?\n`)
)

func extractTerm(text string) (int, error) {
	submatches := TermRegexp.FindStringSubmatchIndex(text)
	if submatches == nil {
		return 0, fmt.Errorf("finding term submatches: term id not found")
	}
	season := text[submatches[2]:submatches[3]]
	year := text[submatches[4]:submatches[5]]
	term, err := util.TermSeasonYearToId(season, year)
	if err != nil {
		return 0, fmt.Errorf("parsing term season, year info: \"%s %s\" is not a term: %v", season, year, err)
	} else {
		return term, nil
	}
}

func extractClassNumbers(text string) ([]int, error) {
	var err error
	// -1 corresponds to no limit on the number of matches
	submatches := ClassNumberRegexp.FindAllStringSubmatchIndex(text, -1)
	classNumbers := make([]int, len(submatches))
	for i, submatch := range submatches {
		matchText := text[submatch[2]:submatch[3]]
		classNumbers[i], err = strconv.Atoi(matchText)
		if err != nil {
			return nil, fmt.Errorf("converting class number string matches to int: %s is not a class number: %v", matchText, err)
		}
	}
	return classNumbers, nil
}

func Parse(text string) (*ScheduleSummary, error) {
	term, err := extractTerm(text)
	if err != nil {
		return nil, fmt.Errorf("extracting term: %v", err)
	}
	classNumbers, err := extractClassNumbers(text)
	if err != nil {
		return nil, fmt.Errorf("extracting class numbers: %v", err)
	}
	summary := &ScheduleSummary{
		Term:         term,
		ClassNumbers: classNumbers,
	}
	return summary, nil
}
