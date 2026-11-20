package mcp

import (
	"testing"
	"time"
)

func ptr[T any](v T) *T { return &v }

func TestPercent(t *testing.T) {
	cases := []struct {
		in   *float64
		want string
	}{
		{nil, "N/A"},
		{ptr(0.0), "0%"}, // RatingBox.tsx would show this as missing
		{ptr(0.86528497409326424870), "87%"},
		{ptr(0.005), "1%"}, // Math.round rounds half up
		{ptr(1.0), "100%"},
	}
	for _, c := range cases {
		if got := percent(c.in); got != c.want {
			t.Errorf("percent(%v) = %q, want %q", c.in, got, c.want)
		}
	}
}

func TestClockTime(t *testing.T) {
	cases := []struct {
		secs int
		want string
	}{
		{0, "12:00 AM"},
		{8*3600 + 5*60, "8:05 AM"}, // the site's secsToTime prints "8:5 AM"
		{8*3600 + 30*60, "8:30 AM"},
		{12 * 3600, "12:00 PM"},
		{13*3600 + 20*60, "1:20 PM"},
		{23*3600 + 59*60, "11:59 PM"},
	}
	for _, c := range cases {
		if got := clockTime(c.secs); got != c.want {
			t.Errorf("clockTime(%d) = %q, want %q", c.secs, got, c.want)
		}
	}
}

func TestFormatCourseCode(t *testing.T) {
	cases := map[string]string{
		"cs341":  "CS 341",
		"bus97w": "BUS 97W",
		"pd9":    "PD 9",
		"msci":   "MSCI",
		"":       "",
	}
	for in, want := range cases {
		if got := formatCourseCode(in); got != want {
			t.Errorf("formatCourseCode(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestNormalizeCode(t *testing.T) {
	for in, want := range map[string]string{"CS 341": "cs341", " cs341 ": "cs341", "Cs\t135": "cs135"} {
		if got := normalizeCode(in); got != want {
			t.Errorf("normalizeCode(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestAuthorLine(t *testing.T) {
	cases := []struct {
		name string
		in   *author
		want string
	}{
		{"public with program", &author{FullName: ptr("Jane Doe"), Program: ptr("Computer Science")}, "Jane Doe, Computer Science student"},
		{"public without program", &author{FullName: ptr("Jane Doe")}, "Jane Doe"},
		{"anonymous with program", &author{Program: ptr("Software Engineering")}, "Software Engineering student"},
		{"anonymous without program", &author{}, "A student"},
		{"no author row", nil, "A student"},
		{"empty strings", &author{FullName: ptr(""), Program: ptr("")}, "A student"},
	}
	for _, c := range cases {
		if got := authorLine(c.in); got != c.want {
			t.Errorf("%s: authorLine = %q, want %q", c.name, got, c.want)
		}
	}
}

func TestReviewDate(t *testing.T) {
	cases := map[string]string{
		"2026-10-05T19:41:41.200998+00:00": "2026-10-05",
		"2026-10-06T02:00:00+00:00":        "2026-10-05", // still Oct 5 in Waterloo
		"2011-12-31T23:59:59+00:00":        "",           // legacy: the site shows no date
		"2012-01-01T12:00:00+00:00":        "2012-01-01",
		"not a date":                       "",
	}
	for in, want := range cases {
		if got := reviewDate(in); got != want {
			t.Errorf("reviewDate(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestScale(t *testing.T) {
	if scale(nil) != nil {
		t.Error("scale(nil) should stay nil")
	}
	if got := *scale(ptr(0)); got != 1 {
		t.Errorf("scale(0) = %d, want 1", got)
	}
	if got := *scale(ptr(4)); got != 5 {
		t.Errorf("scale(4) = %d, want 5", got)
	}
}

func TestTerms(t *testing.T) {
	names := map[int]string{1271: "Winter 2027", 1265: "Spring 2026", 1269: "Fall 2026", 1001: "Winter 2000"}
	for id, want := range names {
		if got := termName(id); got != want {
			t.Errorf("termName(%d) = %q, want %q", id, got, want)
		}
	}

	current := []struct {
		at   time.Time
		want int
	}{
		{time.Date(2026, 11, 19, 12, 0, 0, 0, waterloo), 1269},
		{time.Date(2026, 4, 30, 23, 0, 0, 0, waterloo), 1261},
		{time.Date(2026, 5, 1, 0, 0, 0, 0, waterloo), 1265},
		// 04:30 UTC on Jan 1 is still Dec 31 in Waterloo.
		{time.Date(2027, 1, 1, 4, 30, 0, 0, time.UTC), 1269},
		{time.Date(2027, 1, 1, 5, 30, 0, 0, time.UTC), 1271},
	}
	for _, c := range current {
		if got := currentTerm(c.at); got != c.want {
			t.Errorf("currentTerm(%v) = %d, want %d", c.at, got, c.want)
		}
	}

	for in, want := range map[int]int{1261: 1265, 1265: 1269, 1269: 1271} {
		if got := nextTerm(in); got != want {
			t.Errorf("nextTerm(%d) = %d, want %d", in, got, want)
		}
	}
}

func TestParseTerm(t *testing.T) {
	good := map[string]int{
		"1271":        1271,
		"Winter 2027": 1271,
		"W27":         1271,
		"w 27":        1271,
		"fall 2026":   1269,
		"F26":         1269,
		"Spring 2026": 1265,
		"summer 2026": 1265,
		"S'26":        1265,
	}
	for in, want := range good {
		got, err := parseTerm(in)
		if err != nil || got != want {
			t.Errorf("parseTerm(%q) = %d, %v; want %d", in, got, err, want)
		}
	}
	for _, in := range []string{"", "1272", "next term", "Winter"} {
		if _, err := parseTerm(in); err == nil {
			t.Errorf("parseTerm(%q) should fail", in)
		}
	}
}
