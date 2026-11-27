package mcp

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// Term ids are UW's: (year - 1900) * 10 + start month, so 1271 is Winter 2027.

// termName mirrors termCodeToDate (frontend/src/utils/Misc.tsx).
func termName(id int) string {
	season := "Fall"
	switch id % 10 {
	case 1:
		season = "Winter"
	case 5:
		season = "Spring"
	}
	return fmt.Sprintf("%s %d", season, 1900+id/10)
}

// currentTerm mirrors getCurrentTermCode: Jan-Apr Winter, May-Aug Spring,
// Sep-Dec Fall.
func currentTerm(now time.Time) int {
	now = now.In(waterloo)
	month := 9
	switch {
	case now.Month() <= time.April:
		month = 1
	case now.Month() <= time.August:
		month = 5
	}
	return (now.Year()-1900)*10 + month
}

// nextTerm mirrors getNextTermCode.
func nextTerm(term int) int {
	if term%10 == 1 || term%10 == 5 {
		return term + 4
	}
	return term + 2
}

func termStart(id int) time.Time {
	return time.Date(1900+id/10, time.Month(id%10), 1, 0, 0, 0, 0, waterloo)
}

var termPattern = regexp.MustCompile(`^(winter|spring|summer|fall|autumn|w|s|f)\s*'?(\d{2}|\d{4})$`)

// parseTerm accepts a term id ("1271") or a name ("Winter 2027", "W27",
// "fall 2026").
func parseTerm(s string) (int, error) {
	s = strings.ToLower(strings.TrimSpace(s))
	if id, err := strconv.Atoi(s); err == nil {
		if id%10 == 1 || id%10 == 5 || id%10 == 9 {
			return id, nil
		}
		return 0, userErr("%d is not a term id: the last digit must be 1, 5 or 9", id)
	}
	m := termPattern.FindStringSubmatch(s)
	if m == nil {
		return 0, userErr("unrecognised term %q: use a name like \"Winter 2027\" or an id like 1271", s)
	}
	year, _ := strconv.Atoi(m[2])
	if len(m[2]) == 2 {
		year += 2000
	}
	month := 9
	switch m[1] {
	case "winter", "w":
		month = 1
	case "spring", "summer", "s":
		month = 5
	}
	return (year-1900)*10 + month, nil
}
