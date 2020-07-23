package test

import (
	"fmt"
	"io/ioutil"
	"testing"

	"flow/api/parse/schedule"
)

func testOne(t *testing.T, filename string, expected schedule.Summary) {
}

func TestParseSchedule(t *testing.T) {
	tests := []struct {
		name string
		want schedule.Summary
	}{
		// This schedule is perfectly normal.
		{
			"normal",
			schedule.Summary{
				TermId: 1199,
				ClassNumbers: []int{
					4896, 4897, 4899, 4741, 4742, 5003, 4747, 4748, 7993, 7994, 7995, 4751, 4752,
				},
			},
		},
		// This schedule does not have parentheses around class numbers.
		{
			"noparen",
			schedule.Summary{
				TermId: 1199,
				ClassNumbers: []int{
					5211, 8052, 9289, 6394, 5867, 6321, 6205, 7253, 7254,
				},
			},
		},
		// This schedule is old (carried over from Flow 1.0)
		{
			"old",
			schedule.Summary{
				TermId: 1135,
				ClassNumbers: []int{
					3370, 3077, 3078, 3166, 2446, 4106, 4107, 4108, 4111, 4117, 4118, 4110,
				},
			},
		},
		// This schedule has an abrnomal amount of whitespace
		{
			"whitespace",
			schedule.Summary{
				TermId: 1199,
				ClassNumbers: []int{
					4669, 4658, 4660, 4699, 4655, 4656, 4661, 4662, 4850, 4664, 4666, 4936, 4639, 4668, 7634,
				},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			path := fmt.Sprintf("testdata/schedule-%s.txt", tt.name)
			bytes, err := ioutil.ReadFile(path)
			if err != nil {
				t.Fatalf("could not open fixture: %v", err)
			}
			summary, err := schedule.Parse(string(bytes))
			if err != nil {
				t.Fatalf("could not parse schedule: %v", err)
			}
			if !summary.Equals(tt.want) {
				t.Fatalf("want\n%+v\ngot\n%v\n", tt.want, summary)
			}
		})
	}
}
