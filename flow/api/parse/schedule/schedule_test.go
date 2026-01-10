package schedule

import (
	"fmt"
	"io/ioutil"
	"testing"

	"github.com/google/go-cmp/cmp"
)

func TestParseSchedule(t *testing.T) {
	tests := []struct {
		name string
		want *Summary
	}{
		// This schedule is perfectly normal.
		{
			"normal",
			&Summary{
				TermId: 1199,
				Classes: []Class{
					{4896, "MC 2038"}, {4897, "MC 4064, DWE 2527"}, {4899, "E3 2119"},
					{4741, "CPH 3681"}, {4742, "CPH 3681"}, {5003, "CPH 3681"},
					{4747, "CPH 3681"}, {4748, "CPH 3681"}, {7993, "MC 2034"},
					{7994, "CPH 3681"}, {7995, "CPH 1346"}, {4751, "CPH 3681"},
					{4752, "CPH 3681"},
				},
			},
		},
		// This schedule does not have parentheses around class numbers.
		{
			"noparen",
			&Summary{
				TermId: 1199,
				Classes: []Class{
					{5211, "E7 2317"}, {8052, "RCH 101"}, {9289, "MC 2034"},
					{6394, "TBA"}, {5867, "MC 2017"}, {6321, "TBA"},
					{6205, "AL 124"}, {7253, "DC 1351"}, {7254, "DC 1351"},
				},
			},
		},
		// This schedule is old (carried over from Flow 1.0)
		{
			"old",
			&Summary{
				TermId: 1135,
				Classes: []Class{
					{3370, "MC   4040"}, {3077, "QNC 1502"}, {3078, "QNC 1502"},
					{3166, "TBA"}, {2446, "STP 105"}, {4106, "RCH   307"},
					{4107, "MC   2038"}, {4108, "MC   2038"}, {4111, "TBA"},
					{4117, "MC   2038"}, {4118, "TBA"}, {4110, "TBA"},
				},
			},
		},
		// This schedule has an abnormal amount of whitespace
		{
			"whitespace",
			&Summary{
				TermId: 1199,
				Classes: []Class{
					{4669, "E5 3102, E5 3101"}, {4658, "E5 3101"}, {4660, "DWE 3518"},
					{4699, "CPH 1346"}, {4655, "E5 3102, E5 3101"}, {4656, "MC 4063"},
					{4661, "E5 3101, E5 3102"}, {4662, "E5 3101"}, {4850, "E3 3164"},
					{4664, "E5 3101, E5 3102"}, {4666, "MC 4060"}, {4936, "E2 2363"},
					{4639, "E5 3101"}, {4668, "EV3 4412"}, {7634, "TBA"},
				},
			},
		},
		// This schedule has class codes longer than 4 digits
		{
			"long-classnumber",
			&Summary{
				TermId: 1219,
				Classes: []Class{
					{4262, "ONLN - Online"}, {11810, "ONLN - Online"}, {9336, "ONLN - Online"},
					{6336, "ONLN - Online"}, {6367, "ONLN - Online"}, {10692, "ONLN - Online"},
					{10310, "ONLN - Online"}, {8204, "ONLN - Online"}, {10376, "ONLN - Online"},
				},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			path := fmt.Sprintf("testdata/schedule-%s.txt", tt.name)
			bytes, err := ioutil.ReadFile(path)
			if err != nil {
				t.Fatalf("opening testdata: %v", err)
			}
			got, err := Parse(string(bytes))
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
