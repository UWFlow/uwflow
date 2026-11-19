package schedule

import (
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"flow/common/util"
)

type Class struct {
	Number   int
	Location string
}

type Summary struct {
	// Term ids are numbers of the form 1189 (Fall 2018)
	TermId int
	// Classes contains the parsed sections and their locations
	Classes []Class
}

var (
	termRegexp = regexp.MustCompile(`(Spring|Fall|Winter)\s+(\d{4})`)

	// Class numbers are *the* four or five digit sequences
	// which occur on a separate line, perhaps parenthesized.
	// To be safe, we pre-emptively handle sequences up to length 8.
	// This should be fine since the only other numbers that appear
	// on their own line are the course code numbers (length 2 or 3).
	classNumberRegexp = regexp.MustCompile(`\n\(?(\d{4,8})\)?\n`)

	// Matches room locations that appear on their own line
	// Building codes (alphanumeric with at least one letter) + space + room numbers, or TBA, or ONLN - Online
	classroomRegexp = regexp.MustCompile(`(?m)^([A-Z0-9]*[A-Z][A-Z0-9]*\s+\d+|TBA|ONLN - Online)$`)
)

var (
	// ErrNoTerm means the paste has no term header such as "Fall 2026".
	ErrNoTerm = errors.New("term not found")
	// ErrCourseSelection means the paste is the Course Selection page
	// rather than My Class Schedule.
	ErrCourseSelection = errors.New("pasted course selection page")
	// ErrNotRegistered means Quest says the user has no classes in the term.
	ErrNotRegistered = errors.New("not registered for classes in term")
)

// The patterns below match Quest's page copy, which UW can reword at any time
// and which differs between the undergrad and grad views. They were tuned
// against 883 captured pastes on 2026-07-27 (commit 6702312), a snapshot of
// one term's Quest rather than a contract. They only run on pastes with no
// class numbers, so a stale pattern degrades to empty_schedule, never to a bad
// import. If one misfires, delete that case rather than hand-tuning it: a
// generic message beats a confidently wrong one.
var (
	// Quest prints this on My Class Schedule when the term has no enrolments.
	notRegisteredRegexp = regexp.MustCompile(`(?i)you are not registered for classes in this term`)

	// Match the Course Selection page by its own name ("View My Course Selection"
	// tab, "My Course Selection" heading). Plain "Course Selection" also appears
	// in the Quest nav on every page and on the Enrollment Dates page.
	courseSelectionRegexp = regexp.MustCompile(`(?i)my course selection`)
)

type match struct {
	pos int
	val string
}

func extractTerm(text string) (int, error) {
	submatches := termRegexp.FindStringSubmatchIndex(text)
	if submatches == nil {
		return 0, ErrNoTerm
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

func extractClassNumbers(text string) ([]match, error) {
	submatches := classNumberRegexp.FindAllStringSubmatchIndex(text, -1)
	matches := make([]match, len(submatches))
	for i, submatch := range submatches {
		matches[i] = match{
			pos: submatch[0],
			val: text[submatch[2]:submatch[3]],
		}
	}
	return matches, nil
}

func extractClassrooms(text string) ([]match, error) {
	submatches := classroomRegexp.FindAllStringSubmatchIndex(text, -1)
	matches := make([]match, len(submatches))
	for i, submatch := range submatches {
		matches[i] = match{
			pos: submatch[0],
			val: text[submatch[2]:submatch[3]],
		}
	}
	return matches, nil
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
	classrooms, err := extractClassrooms(text)
	if err != nil {
		return nil, fmt.Errorf("extracting classrooms: %w", err)
	}

	// With no class numbers there is nothing to import. Say why when Quest
	// tells us; otherwise return the empty summary for the caller to reject.
	if len(classNumbers) == 0 {
		if notRegisteredRegexp.MatchString(text) {
			return nil, ErrNotRegistered
		}
		if courseSelectionRegexp.MatchString(text) {
			return nil, ErrCourseSelection
		}
	}

	var classes []Class
	roomIdx := 0

	for i, cnMatch := range classNumbers {
		cn, err := strconv.Atoi(cnMatch.val)
		if err != nil {
			return nil, fmt.Errorf("%s is not a class number: %w", cnMatch.val, err)
		}

		// Determine the end position for this class's context.
		// It ends where the NEXT class number begins.
		// If this is the last class, the context goes to the end of the text.
		nextPos := len(text)
		if i+1 < len(classNumbers) {
			nextPos = classNumbers[i+1].pos
		}

		// Collect all classrooms that fall within (cnMatch.pos, nextPos)
		var locs []string
		for roomIdx < len(classrooms) {
			room := classrooms[roomIdx]
			if room.pos > nextPos {
				// This room belongs to a future class
				break
			}
			if room.pos > cnMatch.pos {
				// Only add if it appears *after* the current class number start
				locs = append(locs, room.val)
			}
			roomIdx++
		}

		// Dedup locations
		seen := make(map[string]bool)
		var uniqueLocs []string
		for _, l := range locs {
			normalizedLoc := strings.TrimSpace(l)

			if !seen[normalizedLoc] {
				seen[normalizedLoc] = true
				uniqueLocs = append(uniqueLocs, normalizedLoc)
			}
		}

		classes = append(classes, Class{
			Number:   cn,
			Location: strings.Join(uniqueLocs, ", "),
		})
	}

	return &Summary{
		TermId:  term,
		Classes: classes,
	}, nil
}
