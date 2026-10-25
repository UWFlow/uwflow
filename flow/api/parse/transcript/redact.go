package transcript

import (
	"regexp"
	"strings"
)

// Redact reduces transcript text to the structure the parser depends on,
// so it can be sent off-server to debug parsing failures.
//
// It works by allowlist: only lines that can affect Parse survive,
// and within them only the parts Parse reads.
//
//   - Term headings and course codes are kept. Program and level are kept.
//     UWFlow already stores all of these on the user's account.
//   - Every grade becomes GG and every credit amount becomes 9.99,
//     so passes, failures, and marks of 100 look identical.
//   - Course descriptions become x. Digits in the student ID become 0.
//   - Every other line, including name, addresses, dates, GPAs, averages,
//     standing, honours, milestones, and awards, is dropped. A run of
//     dropped lines becomes a single "…", so not even the number of
//     dropped lines survives.
//   - Runs of two or more spaces become exactly two spaces, so column
//     widths cannot reveal the width of a redacted value.
//
// Parsing the redacted text gives the same terms, levels, courses, and
// program as the original, with a zero student number and GG grades.
// This lets a failure be reproduced by running Parse on the report.
func Redact(text string) string {
	var out []string
	dropping := false
	for _, line := range strings.Split(text, "\n") {
		redacted, ok := redactLine(line)
		if !ok {
			if !dropping {
				out = append(out, "…")
				dropping = true
			}
			continue
		}
		out = append(out, redacted)
		dropping = false
	}
	return strings.Join(out, "\n")
}

var (
	wideSpaceRegexp = regexp.MustCompile(`\x20{2,}`)
	// Looser than courseRegexp, so that course lines the parser misses
	// are kept too: those are exactly what a report needs to show.
	// The number must be a whole token, so lines like "GPA  91.60" are not
	// mistaken for courses and kept verbatim.
	courseLikeRegexp = regexp.MustCompile(`^\s*[A-Z]{2,}\s+\d\w*(\s|$)`)
	tokenRegexp      = regexp.MustCompile(`\S+|\s+`)
	digitRegexp      = regexp.MustCompile(`\d`)
)

func redactLine(line string) (string, bool) {
	line = wideSpaceRegexp.ReplaceAllString(line, "  ")
	switch {
	case termRegexp.MatchString(line):
		return line, true
	case courseLikeRegexp.MatchString(line):
		return redactCourseLine(line), true
	case strings.Contains(line, "Program:"):
		return line[strings.Index(line, "Program:"):], true
	}
	if m := levelRegexp.FindString(line); m != "" {
		return m, true
	}
	if m := studentIdRegexp.FindString(line); m != "" {
		return digitRegexp.ReplaceAllString(m, "0"), true
	}
	return "", false
}

// redactCourseLine keeps the department, number, and spacing,
// and replaces everything the student wrote or earned.
func redactCourseLine(line string) string {
	tokens := tokenRegexp.FindAllString(line, -1)

	// Keep leading whitespace, department, separator, and number.
	start := 0
	for words := 0; start < len(tokens) && words < 2; start++ {
		if strings.TrimSpace(tokens[start]) != "" {
			words++
		}
	}

	lastCredit := -1
	for i := start; i < len(tokens); i++ {
		if creditRegexp.MatchString(tokens[i]) {
			lastCredit = i
		}
	}

	var b strings.Builder
	for _, token := range tokens[:start] {
		b.WriteString(token)
	}
	space, previous := "", ""
	for i := start; i < len(tokens); i++ {
		token := tokens[i]
		if strings.TrimSpace(token) == "" {
			space = token
			continue
		}
		var replacement string
		switch {
		case creditRegexp.MatchString(token):
			replacement = "9.99"
		case lastCredit != -1 && i > lastCredit:
			replacement = "GG"
		default:
			replacement = "x"
		}
		// A multi-word description collapses into one x,
		// so its word count is not revealed either.
		if replacement != "x" || previous != "x" {
			b.WriteString(space)
			b.WriteString(replacement)
		}
		space, previous = "", replacement
	}
	b.WriteString(space)
	return b.String()
}
