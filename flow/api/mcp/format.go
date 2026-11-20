package mcp

import (
	"fmt"
	"math"
	"strings"
	"time"
	_ "time/tzdata"
)

const siteURL = "https://uwflow.com"

// waterloo is where term boundaries are drawn. The frontend uses the
// browser's local time; the server has no browser, so it uses campus time.
var waterloo = mustLoadLocation("America/Toronto")

func mustLoadLocation(name string) *time.Location {
	loc, err := time.LoadLocation(name)
	if err != nil {
		panic(err)
	}
	return loc
}

// percent mirrors processRating (frontend/src/utils/Misc.tsx).
// RatingBox.tsx shows an exact 0% as missing; this returns "0%".
func percent(v *float64) string {
	if v == nil {
		return "N/A"
	}
	return fmt.Sprintf("%d%%", int(math.Round(*v*100)))
}

// formatCourseCode mirrors formatCourseCode (utils/Misc.tsx): "cs341" -> "CS 341".
func formatCourseCode(code string) string {
	i := 0
	for i < len(code) && isLetter(code[i]) {
		i++
	}
	if i == 0 || i == len(code) {
		return strings.ToUpper(code)
	}
	return strings.ToUpper(code[:i] + " " + code[i:])
}

func isLetter(c byte) bool { return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') }
func isDigit(c byte) bool  { return c >= '0' && c <= '9' }

// normalizeCode turns user input such as "CS 341" into the stored form
// "cs341". The website lowercases its URL segment the same way.
func normalizeCode(code string) string {
	return strings.ToLower(strings.Join(strings.Fields(code), ""))
}

// clockTime formats seconds after midnight as the site does (secsToTime in
// utils/Misc.tsx), except that minutes 1-9 keep their leading zero.
func clockTime(secs int) string {
	h := (secs / 3600) % 12
	if h == 0 {
		h = 12
	}
	suffix := "AM"
	if secs >= 12*3600 {
		suffix = "PM"
	}
	return fmt.Sprintf("%d:%02d %s", h, (secs%3600)/60, suffix)
}

// scale converts a stored 0-4 rating to the 1-5 scale the site displays
// (MetricIfExists in components/display/Review.tsx).
func scale(v *int) *int {
	if v == nil {
		return nil
	}
	s := *v + 1
	return &s
}

// authorLine mirrors the byline in components/display/Review.tsx for a
// logged-out visitor.
func authorLine(a *author) string {
	var name, program string
	if a != nil {
		name = deref(a.FullName)
		program = deref(a.Program)
	}
	programText := ""
	if program != "" {
		programText = program + " student "
	}
	authorText := ""
	if name != "" {
		authorText = name
		if programText != "" {
			authorText += ","
		}
		authorText += " "
	}
	if authorText == "" && programText == "" {
		return "A student"
	}
	return strings.TrimSpace(authorText + programText)
}

// legacyCutoff: the site hides dates on reviews created before 2012, which
// came from an older import and carry no meaningful timestamp.
var legacyCutoff = time.Date(2012, 1, 1, 0, 0, 0, 0, time.UTC)

func parseTimestamp(s string) (time.Time, bool) {
	for _, layout := range []string{time.RFC3339Nano, "2006-01-02T15:04:05.999999999", "2006-01-02"} {
		if t, err := time.Parse(layout, s); err == nil {
			return t, true
		}
	}
	return time.Time{}, false
}

// reviewDate returns the review's date in Waterloo, or "" where the site
// shows none.
func reviewDate(createdAt string) string {
	t, ok := parseTimestamp(createdAt)
	if !ok || t.Before(legacyCutoff) {
		return ""
	}
	return t.In(waterloo).Format("2006-01-02")
}

func deref(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func courseURL(code string) string { return siteURL + "/course/" + code }
func profURL(code string) string   { return siteURL + "/professor/" + code }
