package test

import (
	"io/ioutil"
	"testing"

	"github.com/AyushK1/uwflow2.0/backend/api/parse"
	"github.com/AyushK1/uwflow2.0/backend/api/parse/transcript"
)

var expectedPreamble = `  University of Waterloo                                                                                                Page 1 of 2
  200 University Ave. West                                                                                              05/07/2019
  Waterloo Ontario Canada N2L3G1
                                                   Undergraduate Unofficial Transcript`

var expectedSummary = transcript.TranscriptSummary{
	StudentNumber: 20705374,
	ProgramName:   "Computer Science/Digital Hardware Option, Honours, Co-operative Program",
	CourseHistory: []transcript.TermSummary{
		{
			Term:    1179,
			Level:   "1A",
			Courses: []string{"cs145", "math145", "math147", "psych101", "spcom223"},
		},
		{
			Term:    1181,
			Level:   "1B",
			Courses: []string{"cs146", "ece124", "engl306a", "math146", "math148", "pd1", "stat230"},
		},
		{
			Term:    1185,
			Level:   "2A",
			Courses: []string{"coop1", "pd11"},
		},
		{
			Term:    1189,
			Level:   "2A",
			Courses: []string{"cs241e", "cs245", "cs246e", "ece222", "math249"},
		},
		{
			Term:    1191,
			Level:   "2B",
			Courses: []string{"coop2", "pd10", "wkrpt200m"},
		},
		{
			Term:    1195,
			Level:   "2B",
			Courses: []string{"cs240e", "cs370", "math245", "math247", "stat231"},
		},
	},
}

func TestPdfToText(t *testing.T) {
	bytes, err := ioutil.ReadFile("fixtures/transcript.pdf")
	if err != nil {
		t.Fatalf("could not open fixture: %v", err)
	}
	text, err := parse.PdfToText(bytes)
	if err != nil {
		t.Fatalf("could not convert file: %v", err)
	}
	if text[:len(expectedPreamble)] != expectedPreamble {
		t.Fatalf("expected %v, got %v", expectedPreamble, text[:len(expectedPreamble)])
	}
}

func TestParseTranscript(t *testing.T) {
	bytes, err := ioutil.ReadFile("fixtures/transcript.pdf")
	if err != nil {
		t.Fatalf("could not open transcript fixture: %v", err)
	}
	text, err := parse.PdfToText(bytes)
	if err != nil {
		t.Fatalf("could not convert transcript: %v", err)
	}
	summary, err := transcript.Parse(text)
	if err != nil {
		t.Fatalf("could not parse transcript: %v", err)
	}
	if !summary.Equals(expectedSummary) {
		t.Fatalf("expected %v, got %v", expectedSummary, summary)
	}
}
