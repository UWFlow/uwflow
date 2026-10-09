package transcript

import (
	"fmt"
	"io/ioutil"
	"testing"

	"flow/api/parse/pdf"

	"github.com/google/go-cmp/cmp"
)

func grade(n int) *int {
	return &n
}

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
						TermId: 1179,
						Level:  "1A",
						Courses: []TermCourse{
							{Code: "cs145", Units: 0.5, Grade: grade(97)},
							{Code: "math145", Units: 0.5, Grade: grade(95)},
							{Code: "math147", Units: 0.5, Grade: grade(97)},
							{Code: "psych101", Units: 0.5, Grade: grade(84)},
							{Code: "spcom223", Units: 0.5, Grade: grade(85)},
						},
					},
					{
						TermId: 1181,
						Level:  "1B",
						Courses: []TermCourse{
							{Code: "cs146", Units: 0.5, Grade: grade(100)},
							{Code: "ece124", Units: 0.5, Grade: grade(95)},
							{Code: "engl306a", Units: 0.5, Grade: grade(93)},
							{Code: "math146", Units: 0.5, Grade: grade(100)},
							{Code: "math148", Units: 0.5, Grade: grade(92)},
							{Code: "pd1", Units: 0.5}, // CR
							{Code: "stat230", Units: 0.5, Grade: grade(90)},
						},
					},
					{
						TermId: 1185,
						Level:  "2A",
						Courses: []TermCourse{
							{Code: "coop1", Units: 0.5},
							{Code: "pd11", Units: 0.5},
						},
					},
					{
						TermId: 1189,
						Level:  "2A",
						Courses: []TermCourse{
							{Code: "cs241e", Units: 0.5, Grade: grade(100)},
							{Code: "cs245", Units: 0.5, Grade: grade(91)},
							{Code: "cs246e", Units: 0.5, Grade: grade(100)},
							{Code: "ece222", Units: 0.5, Grade: grade(100)},
							{Code: "math249", Units: 0.5, Grade: grade(81)},
						},
					},
					{
						TermId: 1191,
						Level:  "2B",
						Courses: []TermCourse{
							{Code: "coop2", Units: 0.5},
							{Code: "pd10", Units: 0.5},
							{Code: "wkrpt200m", Units: 0.13}, // NG
						},
					},
					{
						TermId: 1195,
						Level:  "2B",
						// Current term at time of export: no units/grades listed.
						Courses: []TermCourse{
							{Code: "cs240e"},
							{Code: "cs370"},
							{Code: "math245"},
							{Code: "math247"},
							{Code: "stat231"},
						},
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
						TermId: 1179,
						Level:  "1A",
						Courses: []TermCourse{
							{Code: "cs137", Units: 0.5, Grade: grade(86)},
							{Code: "ece105", Units: 0.5, Grade: grade(75)},
							{Code: "math115", Units: 0.5, Grade: grade(90)},
							{Code: "math117", Units: 0.5, Grade: grade(93)},
							{Code: "math135", Units: 0.5, Grade: grade(87)},
							{Code: "se101", Units: 0.25, Grade: grade(98)},
						},
					},
					{
						TermId: 1181,
						Level:  "1B",
						Courses: []TermCourse{
							{Code: "cs138", Units: 0.5, Grade: grade(89)},
							{Code: "ece106", Units: 0.5, Grade: grade(72)},
							{Code: "ece124", Units: 0.5, Grade: grade(84)},
							{Code: "ece140", Units: 0.5, Grade: grade(75)},
							{Code: "math119", Units: 0.5, Grade: grade(87)},
						},
					},
					{
						TermId: 1185,
						Level:  "1B",
						Courses: []TermCourse{
							{Code: "coop1", Units: 0.5},
							{Code: "pd20", Units: 0.5},
						},
					},
					{
						TermId: 1189,
						Level:  "2A",
						Courses: []TermCourse{
							{Code: "che102", Units: 0.5, Grade: grade(84)},
							{Code: "cs241e", Units: 0.5, Grade: grade(78)},
							{Code: "ece222", Units: 0.5, Grade: grade(89)},
							{Code: "se212", Units: 0.5, Grade: grade(73)},
							{Code: "smf213", Units: 0.5, Grade: grade(83)},
							{Code: "spcom223", Units: 0.5, Grade: grade(85)},
							{Code: "stat206", Units: 0.5, Grade: grade(86)},
						},
					},
					{
						TermId: 1191,
						Level:  "2A",
						Courses: []TermCourse{
							{Code: "coop2", Units: 0.5},
							{Code: "pd21", Units: 0.5},
						},
					},
					{
						TermId: 1195,
						Level:  "2B",
						Courses: []TermCourse{
							{Code: "cs240", Units: 0.5, Grade: grade(85)},
							{Code: "cs247", Units: 0.5, Grade: grade(89)},
							{Code: "earth121", Units: 0.5, Grade: grade(83)},
							{Code: "ece358", Units: 0.5, Grade: grade(80)},
							{Code: "math239", Units: 0.5, Grade: grade(74)},
							{Code: "msci261", Units: 0.5, Grade: grade(87)},
							{Code: "wkrpt200", Units: 0.13, Grade: grade(95)},
						},
					},
					{
						TermId: 1199,
						Level:  "2B",
						Courses: []TermCourse{
							{Code: "coop3", Units: 0.5},
							{Code: "pd10", Units: 0.5},
						},
					},
					{
						TermId: 1201,
						Level:  "4A",
						Courses: []TermCourse{
							{Code: "cs341"},
							{Code: "cs350"},
							{Code: "cs370"},
							{Code: "phil256"},
							{Code: "syde552"},
						},
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
