package test

import (
	"io/ioutil"
	"testing"

	"flow/api/parse/schedule"
)

func testOne(t *testing.T, filename string, expected schedule.Summary) {
	bytes, err := ioutil.ReadFile(filename)
	if err != nil {
		t.Fatalf("could not open fixture: %v", err)
	}
	summary, err := schedule.Parse(string(bytes))
	if err != nil {
		t.Fatalf("could not parse schedule: %v", err)
	}
	if !summary.Equals(expected) {
		t.Fatalf("expected %v, got %v", expected, summary)
	}
}

// This schedule is perfectly normal
func TestParseNormalSchedule(t *testing.T) {
	expected := schedule.Summary{
		TermId: 1199,
		ClassNumbers: []int{
			4896, 4897, 4899, 4741, 4742, 5003, 4747, 4748, 7993, 7994, 7995, 4751, 4752,
		},
	}
	testOne(t, "fixtures/schedule-normal.txt", expected)
}

// This schedule does not have parentheses around class numbers
func TestParseNoparenSchedule(t *testing.T) {
	expected := schedule.Summary{
		TermId: 1199,
		ClassNumbers: []int{
			5211, 8052, 9289, 6394, 5867, 6321, 6205, 7253, 7254,
		},
	}
	testOne(t, "fixtures/schedule-noparen.txt", expected)
}

// This schedule is old (carried over from Flow 1.0)
func TestParseOldSchedule(t *testing.T) {
	expected := schedule.Summary{
		TermId: 1135,
		ClassNumbers: []int{
			3370, 3077, 3078, 3166, 2446, 4106, 4107, 4108, 4111, 4117, 4118, 4110,
		},
	}
	testOne(t, "fixtures/schedule-old.txt", expected)
}

// This schedule has an abrnomal amount of whitespace
func TestParseWhitespaceSchedule(t *testing.T) {
	expected := schedule.Summary{
		TermId: 1199,
		ClassNumbers: []int{
			4669, 4658, 4660, 4699, 4655, 4656, 4661, 4662, 4850, 4664, 4666, 4936, 4639, 4668, 7634,
		},
	}
	testOne(t, "fixtures/schedule-whitespace.txt", expected)
}
