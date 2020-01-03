package test

import (
	"io/ioutil"
	"reflect"
	"testing"

	"flow/api/parse/pdf"
	"flow/api/parse/transcript"
)

var expectedPreamble = `  University of Waterloo                                                                                                Page 1 of 2
  200 University Ave. West                                                                                              05/07/2019
  Waterloo Ontario Canada N2L3G1
                                                   Undergraduate Unofficial Transcript`

var simpleSummary = &transcript.Summary{
	StudentNumber: 20705374,
	ProgramName:   "Computer Science/Digital Hardware Option",
	TermSummaries: []transcript.TermSummary{
		{
			TermId:  1179,
			Level:   "1A",
			Courses: []string{"cs145", "math145", "math147", "psych101", "spcom223"},
		},
		{
			TermId:  1181,
			Level:   "1B",
			Courses: []string{"cs146", "ece124", "engl306a", "math146", "math148", "pd1", "stat230"},
		},
		{
			TermId:  1185,
			Level:   "2A",
			Courses: []string{"coop1", "pd11"},
		},
		{
			TermId:  1189,
			Level:   "2A",
			Courses: []string{"cs241e", "cs245", "cs246e", "ece222", "math249"},
		},
		{
			TermId:  1191,
			Level:   "2B",
			Courses: []string{"coop2", "pd10", "wkrpt200m"},
		},
		{
			TermId:  1195,
			Level:   "2B",
			Courses: []string{"cs240e", "cs370", "math245", "math247", "stat231"},
		},
	},
}

var transferSummary = &transcript.Summary{
	StudentNumber: 20718692,
	ProgramName:   "Computer Science",
	TermSummaries: []transcript.TermSummary{
		{
			TermId:  1179,
			Level:   "1A",
			Courses: []string{"cs137", "ece105", "math115", "math117", "math135", "se101"},
		},
		{
			TermId:  1181,
			Level:   "1B",
			Courses: []string{"cs138", "ece106", "ece124", "ece140", "math119"},
		},
		{
			TermId:  1185,
			Level:   "1B",
			Courses: []string{"coop1", "pd20"},
		},
		{
			TermId:  1189,
			Level:   "2A",
			Courses: []string{"che102", "cs241e", "ece222", "se212", "smf213", "spcom223", "stat206"},
		},
		{
			TermId:  1191,
			Level:   "2A",
			Courses: []string{"coop2", "pd21"},
		},
		{
			TermId:  1195,
			Level:   "2B",
			Courses: []string{"cs240", "cs247", "earth121", "ece358", "math239", "msci261", "wkrpt200"},
		},
		{
			TermId:  1199,
			Level:   "2B",
			Courses: []string{"coop3", "pd10"},
		},
		{
			TermId:  1201,
			Level:   "3B",
			Courses: []string{"cs341", "cs350", "cs370", "phil256", "syde552"},
		},
	},
}

func TestPdfToText(t *testing.T) {
	bytes, err := ioutil.ReadFile("fixtures/transcript-simple.pdf")
	if err != nil {
		t.Fatalf("could not open fixture: %v", err)
	}
	text, err := pdf.ToText(bytes)
	if err != nil {
		t.Fatalf("could not convert file: %v", err)
	}
	if text[:len(expectedPreamble)] != expectedPreamble {
		t.Fatalf("expected %v, got %v", expectedPreamble, text[:len(expectedPreamble)])
	}
}

func TestSimpleTranscript(t *testing.T) {
	bytes, err := ioutil.ReadFile("fixtures/transcript-simple.pdf")
	if err != nil {
		t.Fatalf("could not open transcript fixture: %v", err)
	}
	text, err := pdf.ToText(bytes)
	if err != nil {
		t.Fatalf("could not convert transcript: %v", err)
	}
	summary, err := transcript.Parse(text)
	if err != nil {
		t.Fatalf("could not parse transcript: %v", err)
	}
	if !reflect.DeepEqual(summary, simpleSummary) {
		t.Fatalf("expected %+v, got %+v", simpleSummary, summary)
	}
}

func TestTransferTranscript(t *testing.T) {
	bytes, err := ioutil.ReadFile("fixtures/transcript-transfer.pdf")
	if err != nil {
		t.Fatalf("could not open transcript fixture: %v", err)
	}
	text, err := pdf.ToText(bytes)
	if err != nil {
		t.Fatalf("could not convert transcript: %v", err)
	}
	summary, err := transcript.Parse(text)
	if err != nil {
		t.Fatalf("could not parse transcript: %v", err)
	}
	if !reflect.DeepEqual(summary, transferSummary) {
		t.Fatalf("expected %+v, got %+v", transferSummary, summary)
	}
}
