package mcp

import (
	"testing"
	"time"

	"github.com/google/go-cmp/cmp"
)

func TestProcessRawQuery(t *testing.T) {
	cases := []struct {
		query    string
		codeOnly bool
		want     string
	}{
		{"", false, ""},
		{"CS 341", false, "cs:* & 341:*"},
		{"Intro  Algorithms", false, "intro:* & algorithms:*"},
		{"co-op work", false, "co:* & op:* & work:*"},
		// Only the first hyphen becomes a space; later ones are removed.
		{"a-b-c", false, "a:* & bc:*"},
		{"what's (new)?", false, "whats:* & new:*"},
		{"?!", false, ""},
		{"1 2 3 4 5 6 7 8 9 10 11 12", false, "1:* & 2:* & 3:* & 4:* & 5:* & 6:* & 7:* & 8:* & 9:* & 10:*"},
		{"MSCI", true, "MSCI"},
		{"C%S_", true, "CS"},
	}
	for _, c := range cases {
		if got := processRawQuery(c.query, c.codeOnly); got != c.want {
			t.Errorf("processRawQuery(%q, %v) = %q, want %q", c.query, c.codeOnly, got, c.want)
		}
	}
}

func TestMatchesLevel(t *testing.T) {
	all := map[int]bool{1: true, 2: true, 3: true, 4: true, 5: true}
	cases := []struct {
		code   string
		levels map[int]bool
		want   bool
	}{
		{"cs341", map[int]bool{3: true}, true},
		{"cs341", map[int]bool{1: true, 2: true}, false},
		{"cs135", map[int]bool{3: true}, false},
		{"cs798", map[int]bool{5: true}, true},
		// 900-level and similar codes: hidden by the site's [5-8], kept here.
		{"actsc980", all, true},
		{"math97", map[int]bool{5: true}, true},
		{"coop9", all, true},
		{"bus97w", map[int]bool{4: true}, false},
		{"cs341", map[int]bool{}, false},
	}
	for _, c := range cases {
		if got := matchesLevel(c.code, c.levels); got != c.want {
			t.Errorf("matchesLevel(%q, %v) = %v, want %v", c.code, c.levels, got, c.want)
		}
	}
}

func TestPickDisplayCode(t *testing.T) {
	codes := []string{"msci100", "mse100"}
	cases := map[string]string{
		"":        "msci100",
		"mse":     "mse100",
		"MSE 100": "mse100",
		"msci1":   "msci100",
		"mse2":    "mse100", // falls back to the subject prefix
		"econ":    "msci100",
	}
	for query, want := range cases {
		if got := pickDisplayCode(codes, query); got != want {
			t.Errorf("pickDisplayCode(%q) = %q, want %q", query, got, want)
		}
	}
}

func TestCourseFilterKeep(t *testing.T) {
	now := time.Date(2026, 11, 19, 12, 0, 0, 0, waterloo) // Fall 2026; next is Winter 2027
	all := map[int]bool{1: true, 2: true, 3: true, 4: true, 5: true}
	row := courseSearchRow{
		Ratings:                 ptr(12),
		Terms:                   []int{1269, 1271},
		TermsWithSeats:          []int{1271},
		TermsWithOnlineSections: []int{1269},
	}
	cases := []struct {
		name   string
		filter courseFilter
		row    courseSearchRow
		want   bool
	}{
		{"no filters", courseFilter{Levels: all}, row, true},
		{"enough ratings", courseFilter{Levels: all, MinRatings: 10}, row, true},
		{"too few ratings", courseFilter{Levels: all, MinRatings: 20}, row, false},
		{"null ratings pass zero", courseFilter{Levels: all}, courseSearchRow{}, true},
		{"null ratings fail one", courseFilter{Levels: all, MinRatings: 1}, courseSearchRow{}, false},
		{"offered this term", courseFilter{Levels: all, ThisTerm: true}, row, true},
		{"both terms means both", courseFilter{Levels: all, ThisTerm: true, NextTerm: true},
			courseSearchRow{Terms: []int{1269}}, false},
		{"room next term", courseFilter{Levels: all, NextTerm: true, HasRoom: true}, row, true},
		{"no room this term", courseFilter{Levels: all, ThisTerm: true, HasRoom: true}, row, false},
		// With both terms set, seats are checked in the current term.
		{"room uses this term when both", courseFilter{Levels: all, ThisTerm: true, NextTerm: true, HasRoom: true}, row, false},
		{"online this term", courseFilter{Levels: all, ThisTerm: true, HasOnlineSection: true}, row, true},
		{"level filtered out", courseFilter{Levels: map[int]bool{1: true}}, row, false},
	}
	for _, c := range cases {
		if got := c.filter.keep(c.row, "cs341", now); got != c.want {
			t.Errorf("%s: keep = %v, want %v", c.name, got, c.want)
		}
	}
}

func TestSortRows(t *testing.T) {
	type row struct {
		name  string
		score *float64
	}
	rows := []row{{"b", ptr(0.5)}, {"a", nil}, {"c", ptr(0.9)}, {"d", ptr(0.5)}}
	byScore := func(r row) sortValue { return numValue(r.score) }
	names := func(rs []row) []string {
		var out []string
		for _, r := range rs {
			out = append(out, r.name)
		}
		return out
	}

	high := append([]row(nil), rows...)
	sortRows(high, byScore, false)
	if diff := cmp.Diff([]string{"c", "b", "d", "a"}, names(high)); diff != "" {
		t.Errorf("default order: high first, ties stable, nulls last (-want +got):\n%s", diff)
	}

	low := append([]row(nil), rows...)
	sortRows(low, byScore, true)
	if diff := cmp.Diff([]string{"b", "d", "c", "a"}, names(low)); diff != "" {
		t.Errorf("reversed: low first, nulls still last (-want +got):\n%s", diff)
	}

	text := append([]row(nil), rows...)
	sortRows(text, func(r row) sortValue { return textValue(r.name) }, false)
	if diff := cmp.Diff([]string{"a", "b", "c", "d"}, names(text)); diff != "" {
		t.Errorf("text: A to Z (-want +got):\n%s", diff)
	}
}

func TestPage(t *testing.T) {
	rows := []int{1, 2, 3, 4, 5}
	if diff := cmp.Diff([]int{3, 4}, page(rows, 2, 2)); diff != "" {
		t.Error(diff)
	}
	if diff := cmp.Diff([]int{5}, page(rows, 4, 10)); diff != "" {
		t.Error(diff)
	}
	if got := page(rows, 9, 2); len(got) != 0 {
		t.Errorf("past the end = %v, want empty", got)
	}
}
