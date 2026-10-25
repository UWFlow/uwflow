package transcript

import (
	"fmt"
	"io/ioutil"
	"testing"

	"flow/api/parse/pdf"

	"github.com/google/go-cmp/cmp"
)

func TestParseTranscript(t *testing.T) {
	tests := []struct {
		name string
		want *Summary
	}{
		{
			"simple",
			&Summary{
				StudentNumber: 20705374,
				ProgramName:   "Computer Science/Digital Hardware Option",
				TermSummaries: []TermSummary{
					{
						TermId:        1179,
						Level:         "1A",
						Courses:       []string{"cs145", "math145", "math147", "psych101", "spcom223"},
						Grades:        []string{"97", "95", "97", "84", "85"},
						TermGPA:       "91.60",
						CumulativeGPA: "91.60",
					},
					{
						TermId:        1181,
						Level:         "1B",
						Courses:       []string{"cs146", "ece124", "engl306a", "math146", "math148", "pd1", "stat230"},
						Grades:        []string{"100", "95", "93", "100", "92", "CR", "90"},
						TermGPA:       "95.00",
						CumulativeGPA: "93.46",
					},
					{
						TermId:        1185,
						Level:         "2A",
						Courses:       []string{"coop1", "pd11"},
						Grades:        []string{"CR", "CR"},
						TermGPA:       "0.00",
						CumulativeGPA: "93.46",
					},
					{
						TermId:        1189,
						Level:         "2A",
						Courses:       []string{"cs241e", "cs245", "cs246e", "ece222", "math249"},
						Grades:        []string{"100", "91", "100", "100", "81"},
						TermGPA:       "94.40",
						CumulativeGPA: "93.75",
					},
					{
						TermId:        1191,
						Level:         "2B",
						Courses:       []string{"coop2", "pd10", "wkrpt200m"},
						Grades:        []string{"CR", "CR", "NG"},
						TermGPA:       "0.00",
						CumulativeGPA: "93.75",
					},
					{
						TermId:  1195,
						Level:   "2B",
						Courses: []string{"cs240e", "cs370", "math245", "math247", "stat231"},
						Grades:  []string{"", "", "", "", ""},
					},
				},
			},
		},
		{
			"transfer",
			&Summary{
				StudentNumber: 20718692,
				ProgramName:   "Computer Science",
				TermSummaries: []TermSummary{
					{
						TermId:        1179,
						Level:         "1A",
						Courses:       []string{"cs137", "ece105", "math115", "math117", "math135", "se101"},
						Grades:        []string{"86", "75", "90", "93", "87", "98"},
						TermGPA:       "87.27",
						CumulativeGPA: "87.27",
					},
					{
						TermId:        1181,
						Level:         "1B",
						Courses:       []string{"cs138", "ece106", "ece124", "ece140", "math119"},
						Grades:        []string{"89", "72", "84", "75", "87"},
						TermGPA:       "81.40",
						CumulativeGPA: "84.48",
					},
					{
						TermId:        1185,
						Level:         "1B",
						Courses:       []string{"coop1", "pd20"},
						Grades:        []string{"CR", "CR"},
						TermGPA:       "0.00",
						CumulativeGPA: "84.48",
					},
					{
						TermId:        1189,
						Level:         "2A",
						Courses:       []string{"che102", "cs241e", "ece222", "se212", "smf213", "spcom223", "stat206"},
						Grades:        []string{"84", "78", "89", "73", "83", "85", "86"},
						TermGPA:       "82.50",
						CumulativeGPA: "83.76",
					},
					{
						TermId:        1191,
						Level:         "2A",
						Courses:       []string{"coop2", "pd21"},
						Grades:        []string{"CR", "CR"},
						TermGPA:       "0.00",
						CumulativeGPA: "83.76",
					},
					{
						TermId:        1195,
						Level:         "2B",
						Courses:       []string{"cs240", "cs247", "earth121", "ece358", "math239", "msci261", "wkrpt200"},
						Grades:        []string{"85", "89", "83", "80", "74", "87", "95"},
						TermGPA:       "83.00",
						CumulativeGPA: "83.58",
					},
					{
						TermId:        1199,
						Level:         "2B",
						Courses:       []string{"coop3", "pd10"},
						Grades:        []string{"CR", "CR"},
						TermGPA:       "0.00",
						CumulativeGPA: "83.58",
					},
					{
						TermId:  1201,
						Level:   "4A",
						Courses: []string{"cs341", "cs350", "cs370", "phil256", "syde552"},
						Grades:  []string{"", "", "", "", ""},
					},
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			path := fmt.Sprintf("testdata/transcript-%s.pdf", tt.name)
			bytes, err := ioutil.ReadFile(path)
			if err != nil {
				t.Fatalf("reading pdf: %v", err)
			}
			text, err := pdf.ToText(bytes)
			if err != nil {
				t.Fatalf("converting: %v", err)
			}
			got, err := Parse(text)
			if err != nil {
				t.Fatalf("parsing: %v", err)
			}
			if !cmp.Equal(tt.want, got) {
				diff := cmp.Diff(tt.want, got)
				t.Fatalf("mismatch (-want +got):\n%s", diff)
			}
		})
	}
}
