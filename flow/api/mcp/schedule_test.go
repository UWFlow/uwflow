package mcp

import (
	"testing"
	"time"

	"github.com/google/go-cmp/cmp"
)

func TestMergeMeetingDateRanges(t *testing.T) {
	prof := &profRef{ID: 7, Code: ptr("jane_doe"), Name: "Jane Doe"}
	meetings := []meeting{
		{Days: []string{"T", "Th"}, StartDate: "2027-02-01", EndDate: "2027-04-05", StartSeconds: ptr(30600), EndSeconds: ptr(35400), Prof: prof},
		// Same schedule, earlier dates and days in another order: merges.
		{Days: []string{"Th", "T"}, StartDate: "2027-01-05", EndDate: "2027-01-30", StartSeconds: ptr(30600), EndSeconds: ptr(35400), Prof: prof},
		// Different instructor: stays separate.
		{Days: []string{"T", "Th"}, StartDate: "2027-01-05", EndDate: "2027-04-05", StartSeconds: ptr(30600), EndSeconds: ptr(35400)},
	}
	got := mergeMeetingDateRanges(meetings)
	if len(got) != 2 {
		t.Fatalf("got %d meetings, want 2", len(got))
	}
	if got[0].StartDate != "2027-01-05" || got[0].EndDate != "2027-04-05" {
		t.Errorf("merged range = %s..%s, want 2027-01-05..2027-04-05", got[0].StartDate, got[0].EndDate)
	}
	if got[1].Prof != nil {
		t.Error("meeting without instructor should stay separate")
	}
}

func TestGroupMeetings(t *testing.T) {
	meetings := []meeting{
		// Listed out of date order on purpose: the page leaves these unsorted.
		{Days: []string{"F"}, StartDate: "2027-03-01", EndDate: "2027-03-01", StartSeconds: ptr(30600), EndSeconds: ptr(35400)},
		{Days: []string{"W", "M"}, StartDate: "2027-01-05", EndDate: "2027-04-05", StartSeconds: ptr(30600), EndSeconds: ptr(35400), Location: ptr("MC 2065")},
		{Days: []string{"T"}, StartDate: "2027-01-05", EndDate: "2027-04-05", StartSeconds: ptr(52200), EndSeconds: ptr(55200), IsCancelled: true},
		{Days: []string{"Th"}, StartDate: "2027-01-05", EndDate: "2027-04-05", StartSeconds: ptr(0), EndSeconds: ptr(0), IsTba: true},
	}
	want := []meetingGroup{
		{
			Time: "8:30 AM - 9:50 AM",
			// Location comes from the group's first meeting, as on the page.
			Dates: []dateRange{
				{Days: []string{"M", "W"}, StartDate: "2027-01-05", EndDate: "2027-04-05"},
				{Days: []string{"F"}, StartDate: "2027-03-01", EndDate: "2027-03-01"},
			},
		},
		{Time: "2:30 PM - 3:20 PM", Cancelled: true, Dates: []dateRange{{Days: []string{"T"}, StartDate: "2027-01-05", EndDate: "2027-04-05"}}},
		{Time: "TBA", TBA: true, Dates: []dateRange{{Days: []string{"Th"}, StartDate: "2027-01-05", EndDate: "2027-04-05"}}},
	}
	if diff := cmp.Diff(want, groupMeetings(meetings)); diff != "" {
		t.Errorf("groupMeetings (-want +got):\n%s", diff)
	}
}

func TestGroupMeetingsJoinsDaysOfEqualRanges(t *testing.T) {
	meetings := []meeting{
		{Days: []string{"W"}, StartDate: "2027-01-05", EndDate: "2027-04-05", StartSeconds: ptr(30600), EndSeconds: ptr(35400), Location: ptr("A")},
		{Days: []string{"M"}, StartDate: "2027-01-05", EndDate: "2027-04-05", StartSeconds: ptr(30600), EndSeconds: ptr(35400), Location: ptr("B")},
	}
	want := []dateRange{{Days: []string{"M", "W"}, StartDate: "2027-01-05", EndDate: "2027-04-05"}}
	got := groupMeetings(meetings)
	if len(got) != 1 {
		t.Fatalf("got %d groups, want 1", len(got))
	}
	if diff := cmp.Diff(want, got[0].Dates); diff != "" {
		t.Errorf("dates (-want +got):\n%s", diff)
	}
	if got[0].Location != "A" {
		t.Errorf("location = %q, want the first meeting's", got[0].Location)
	}
}

func TestDefaultTerm(t *testing.T) {
	terms := []int{1275, 1271, 1269}
	cases := []struct {
		now  time.Time
		want int
	}{
		{time.Date(2026, 11, 19, 12, 0, 0, 0, waterloo), 1271}, // within two months of Jan 1
		{time.Date(2026, 10, 15, 12, 0, 0, 0, waterloo), 1269}, // within two months of Sep 1
		{time.Date(2026, 11, 1, 0, 0, 0, 0, waterloo), 1275},   // exactly two months before Jan 1: excluded, so newest
		{time.Date(2027, 4, 1, 12, 0, 0, 0, waterloo), 1275},
		{time.Date(2028, 1, 1, 12, 0, 0, 0, waterloo), 1275}, // nothing near: newest
	}
	for _, c := range cases {
		if got := defaultTerm(terms, c.now); got != c.want {
			t.Errorf("defaultTerm(%v) = %d, want %d", c.now, got, c.want)
		}
	}
}

func TestTermsOffered(t *testing.T) {
	sections := []section{{TermID: 1269}, {TermID: 1275}, {TermID: 1269}, {TermID: 1271}}
	if diff := cmp.Diff([]int{1275, 1271, 1269}, termsOffered(sections)); diff != "" {
		t.Errorf("termsOffered (-want +got):\n%s", diff)
	}
}

func TestTermSections(t *testing.T) {
	sections := []section{
		{SectionName: "TST 101", TermID: 1271, EnrollmentTotal: 0, EnrollmentCapacity: 0},
		{SectionName: "TUT 102", TermID: 1271, EnrollmentTotal: 30, EnrollmentCapacity: 40},
		{SectionName: "XYZ 001", TermID: 1271},
		{SectionName: "LEC 002", TermID: 1271, EnrollmentTotal: 90, EnrollmentCapacity: 90},
		{SectionName: "LEC 001", TermID: 1271, EnrollmentTotal: 80, EnrollmentCapacity: 90,
			Exams: []exam{{Date: ptr("2027-04-20"), StartSeconds: ptr(32400), EndSeconds: ptr(41400), Location: ptr("PAC")}}},
		{SectionName: "LEC 001", TermID: 1269},
	}
	got := termSections(sections, 1271)
	var names []string
	for _, s := range got {
		names = append(names, s.Section)
	}
	if diff := cmp.Diff([]string{"LEC 001", "LEC 002", "TUT 102", "TST 101", "XYZ 001"}, names); diff != "" {
		t.Errorf("order: by section type, then name; unknown types last (-want +got):\n%s", diff)
	}
	if !got[1].Full || got[0].Full {
		t.Errorf("full flags: LEC 002 = %v (want true), LEC 001 = %v (want false)", got[1].Full, got[0].Full)
	}
	if diff := cmp.Diff([]examInfo{{Date: "2027-04-20", Time: "9:00 AM - 11:30 AM", Location: "PAC"}}, got[0].Exams); diff != "" {
		t.Errorf("exams (-want +got):\n%s", diff)
	}
}

func TestSortReviews(t *testing.T) {
	at := func(day int) time.Time { return time.Date(2026, 1, day, 0, 0, 0, 0, time.UTC) }
	reviews := []sortedReview{
		{review: review{ID: 1}, upvotes: 5, created: at(1)},
		{review: review{ID: 2}, upvotes: 0, created: at(9)},
		{review: review{ID: 3}, upvotes: 2, created: at(9)}, // same time as 2: more upvotes first
		{review: review{ID: 4}, upvotes: 5, created: at(5)}, // same votes as 1: newer first
	}
	ids := func(rs []sortedReview) []int {
		var out []int
		for _, r := range rs {
			out = append(out, r.review.ID)
		}
		return out
	}

	recent := append([]sortedReview(nil), reviews...)
	sortReviews(recent, true)
	if diff := cmp.Diff([]int{3, 2, 4, 1}, ids(recent)); diff != "" {
		t.Errorf("most recent (-want +got):\n%s", diff)
	}

	helpful := append([]sortedReview(nil), reviews...)
	sortReviews(helpful, false)
	if diff := cmp.Diff([]int{4, 1, 3, 2}, ids(helpful)); diff != "" {
		t.Errorf("most helpful (-want +got):\n%s", diff)
	}
}

func TestSortGroups(t *testing.T) {
	two := []sortedReview{{}, {}}
	one := []sortedReview{{}}
	groups := []reviewGroup{
		{name: "Bea", reviews: one, liked: ptr(0.9)},
		{name: "Cal", reviews: two, liked: nil},
		{name: "Abe", reviews: one, liked: ptr(0.9)},
		{name: "Dee", reviews: nil, liked: ptr(0.4)},
	}
	names := func(gs []reviewGroup) []string {
		var out []string
		for _, g := range gs {
			out = append(out, g.name)
		}
		return out
	}
	byName := func(g reviewGroup) string { return g.name }

	byReviews := append([]reviewGroup(nil), groups...)
	sortGroups(byReviews, false, byName)
	if diff := cmp.Diff([]string{"Cal", "Abe", "Bea", "Dee"}, names(byReviews)); diff != "" {
		t.Errorf("most reviews, ties by name (-want +got):\n%s", diff)
	}

	byLiked := append([]reviewGroup(nil), groups...)
	sortGroups(byLiked, true, byName)
	if diff := cmp.Diff([]string{"Abe", "Bea", "Dee", "Cal"}, names(byLiked)); diff != "" {
		t.Errorf("most liked, nulls last, ties by reviews then name (-want +got):\n%s", diff)
	}
}
