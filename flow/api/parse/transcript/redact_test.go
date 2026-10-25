package transcript

import (
	"fmt"
	"os"
	"strings"
	"testing"

	"flow/api/parse/pdf"

	"github.com/google/go-cmp/cmp"
)

func TestRedactLine(t *testing.T) {
	tests := []struct {
		line string
		want string
		ok   bool
	}{
		{"                Fall 2017", "  Fall 2017", true},
		{
			"CS             145           Designing Functional Programs (Advanced Level)                0.50        0.50     97",
			"CS  145  x  9.99  9.99  GG",
			true,
		},
		{
			"PD              1            Career Fundamentals                                           0.50           0.00   CR",
			"PD  1  x  9.99  9.99  GG",
			true,
		},
		{"CS               240E         Data Structures and Data Management (Enriched)", "CS  240E  x", true},
		{"MATH   1XX    Transfer Credit   0.50", "MATH  1XX  x  9.99", true},
		{"ECE 222=CS 251.", "", false},
		{"GPA  91.60", "", false},
		{
			"Program:   Computer Science, Honours, Co-operative Program",
			"Program:  Computer Science, Honours, Co-operative Program",
			true,
		},
		{"Level:      1A         Load: Full-Time      Form Of Study: Enrolment", "Level:  1A", true},
		{"Student ID: 20705374", "Student ID: 00000000", true},
		{"Name:       Shynkevych, Dmytro", "", false},
		{"Cumulative GPA                     91.60 Cumulative Totals    2.50   2.50", "", false},
		{"Academic Standing: Excellent standing Effective 12/31/2017", "", false},
		{"Term Honours:      Term Dean's Honours List", "", false},
		{"2018                      Faculty of Mathematics Scholarship", "", false},
	}
	for _, tt := range tests {
		got, ok := redactLine(tt.line)
		if got != tt.want || ok != tt.ok {
			t.Errorf("redactLine(%q) = %q, %v; want %q, %v", tt.line, got, ok, tt.want, tt.ok)
		}
	}
}

func TestRedactCollapsesDroppedLines(t *testing.T) {
	got := Redact("Name: A\nAddress\nFall 2017\nGPA  91.60\nHonours\nStanding")
	want := "…\nFall 2017\n…"
	if got != want {
		t.Errorf("Redact = %q, want %q", got, want)
	}
}

// Redacted transcripts must reproduce the parser's behaviour on the original,
// and must not contain anything identifying from it.
func TestRedactFixtures(t *testing.T) {
	sensitive := map[string][]string{
		"simple": {
			"20705374", "Shynkevych", "Dmytro", "657358545", "91.60", "96.33",
			"Excellent", "Dean's", "Scholarship", "Braemar", "Workplace", "05/07/2019",
			"Designing", "Full-Time", " 97", " 100", " NG",
		},
		"transfer": {"20718692"},
	}
	for name, strs := range sensitive {
		t.Run(name, func(t *testing.T) {
			bytes, err := os.ReadFile(fmt.Sprintf("testdata/transcript-%s.pdf", name))
			if err != nil {
				t.Fatalf("reading pdf: %v", err)
			}
			text, err := pdf.ToText(bytes)
			if err != nil {
				t.Fatalf("converting: %v", err)
			}
			redacted := Redact(text)

			for _, s := range strs {
				if strings.Contains(redacted, s) {
					t.Errorf("redacted text contains %q", s)
				}
			}

			want, err := Parse(text)
			if err != nil {
				t.Fatalf("parsing original: %v", err)
			}
			got, err := Parse(redacted)
			if err != nil {
				t.Fatalf("parsing redacted: %v\n%s", err, redacted)
			}
			want.StudentNumber = 0
			for i := range want.TermSummaries {
				for j, grade := range want.TermSummaries[i].Grades {
					if grade != "" {
						want.TermSummaries[i].Grades[j] = "GG"
					}
				}
			}
			if diff := cmp.Diff(want, got); diff != "" {
				t.Errorf("parse mismatch (-original +redacted):\n%s", diff)
			}
		})
	}
}
