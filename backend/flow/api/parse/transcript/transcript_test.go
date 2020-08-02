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
			},
		},
		{
			"transfer",
			&Summary{
				StudentNumber: 20718692,
				ProgramName:   "Computer Science",
				TermSummaries: []TermSummary{
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
						Level:   "4A",
						Courses: []string{"cs341", "cs350", "cs370", "phil256", "syde552"},
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
