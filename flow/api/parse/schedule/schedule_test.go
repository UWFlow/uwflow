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
				ClassNumbers: []int{
					4896, 4897, 4899, 4741, 4742, 5003, 4747, 4748, 7993, 7994, 7995, 4751, 4752,
				},
				Classrooms: []string{
					"MC 2038", "MC 4064", "DWE 2527", "E3 2119", "CPH 3681", "CPH 3681", "CPH 3681", "CPH 3681", "CPH 3681", "MC 2034", "CPH 3681", "CPH 1346", "CPH 3681", "CPH 3681",
				},
			},
		},
		// This schedule does not have parentheses around class numbers.
		{
			"noparen",
			&Summary{
				TermId: 1199,
				ClassNumbers: []int{
					5211, 8052, 9289, 6394, 5867, 6321, 6205, 7253, 7254,
				},
				Classrooms: []string{
					"E7 2317", "RCH 101", "MC 2034", "TBA", "MC 2017", "TBA", "AL 124", "DC 1351", "DC 1351",
				},
			},
		},
		// This schedule is old (carried over from Flow 1.0)
		{
			"old",
			&Summary{
				TermId: 1135,
				ClassNumbers: []int{
					3370, 3077, 3078, 3166, 2446, 4106, 4107, 4108, 4111, 4117, 4118, 4110,
				},
				Classrooms: []string{
					"MC   4040", "QNC 1502", "QNC 1502", "TBA", "STP 105", "RCH   307", "MC   2038", "MC   2038", "TBA", "TBA", "MC   2038", "TBA", "TBA", "TBA",
				},
			},
		},
		// This schedule has an abnormal amount of whitespace
		{
			"whitespace",
			&Summary{
				TermId: 1199,
				ClassNumbers: []int{
					4669, 4658, 4660, 4699, 4655, 4656, 4661, 4662, 4850, 4664, 4666, 4936, 4639, 4668, 7634,
				},
				Classrooms: []string{
					"E5 3102", "E5 3102", "E5 3101", "E5 3101", "E5 3101", "E5 3101", "DWE 3518", "CPH 1346", "E5 3102", "E5 3101", "E5 3101", "MC 4063", "E5 3101", "E5 3102", "E5 3101", "E5 3101", "E3 3164", "E5 3101", "E5 3102", "MC 4060", "E2 2363", "E2 2363", "E2 2363", "E2 2363", "E2 2363", "E5 3101", "E5 3101", "E5 3101", "EV3 4412", "TBA",
				},
			},
		},
		// This schedule has class codes longer than 4 digits
		{
			"long-classnumber",
			&Summary{
				TermId: 1219,
				ClassNumbers: []int{
					4262, 11810, 9336, 6336, 6367, 10692, 10310, 8204, 10376,
				},
				Classrooms: []string{
					"ONLN - Online", "ONLN - Online", "ONLN - Online", "ONLN - Online", "ONLN - Online", "ONLN - Online", "ONLN - Online", "ONLN - Online", "ONLN - Online",
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
