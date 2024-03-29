package schedule

import (
	"fmt"
	"regexp"
	"strconv"

	"flow/common/util"
)

type Summary struct {
	// Term ids are numbers of the form 1189 (Fall 2018)
	TermId int
	// Class numbers are four digits (e.g. 4895)
	// and uniquely identify a section of a course within a term.
	ClassNumbers []int
}

var (
	termRegexp = regexp.MustCompile(`(Spring|Fall|Winter)\s+(\d{4})`)
	// Class numbers are *the* four or five digit sequences
	// which occur on a separate line, perhaps parenthesized.
	// To be safe, we pre-emptively handle sequences up to length 8.
	// This should be fine since the only other numbers that appear
	// on their own line are the course code numbers (length 2 or 3).
	classNumberRegexp = regexp.MustCompile(`\n\(?(\d{4,8})\)?\n`)
)

func extractTerm(text string) (int, error) {
	submatches := termRegexp.FindStringSubmatchIndex(text)
	if submatches == nil {
		return 0, fmt.Errorf("term id not found")
	}
	season := text[submatches[2]:submatches[3]]
	year := text[submatches[4]:submatches[5]]
	term, err := util.TermSeasonYearToId(season, year)
	if err != nil {
		return 0, fmt.Errorf("\"%s %s\" is not a term: %w", season, year, err)
	} else {
		return term, nil
	}
}

func extractClassNumbers(text string) ([]int, error) {
	var err error
	// -1 corresponds to no limit on the number of matches
	submatches := classNumberRegexp.FindAllStringSubmatchIndex(text, -1)
	classNumbers := make([]int, len(submatches))
	for i, submatch := range submatches {
		matchText := text[submatch[2]:submatch[3]]
		classNumbers[i], err = strconv.Atoi(matchText)
		if err != nil {
			return nil, fmt.Errorf("%s is not a class number: %w", matchText, err)
		}
	}
	return classNumbers, nil
}

func Parse(text string) (*Summary, error) {
	term, err := extractTerm(text)
	if err != nil {
		return nil, fmt.Errorf("extracting term: %w", err)
	}
	classNumbers, err := extractClassNumbers(text)
	if err != nil {
		return nil, fmt.Errorf("extracting class numbers: %w", err)
	}
	summary := &Summary{
		TermId:       term,
		ClassNumbers: classNumbers,
	}
	return summary, nil
}
