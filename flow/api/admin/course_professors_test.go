package admin

import "testing"

func TestParseCourseProfessorUpload(t *testing.T) {
	payload := []byte(`[
		{
			"term_code": 1265,
			"data": [
				{
					"course_code": "CS 135",
					"course_id": 123,
					"instructor": " Jane   Doe, "
				},
				{
					"course_code": "cs135",
					"course_id": 123,
					"instructor": "Jane Doe"
				},
				{
					"course_code": "MATH 137",
					"course_id": 456,
					"instructor": ""
				}
			]
		},
		{
			"term_code": 1269,
			"course_code": "STAT 230",
			"instructor": "John Smith"
		}
	]`)

	got, err := parseCourseProfessorUpload(payload)
	if err != nil {
		t.Fatalf("parseCourseProfessorUpload returned error: %v", err)
	}

	if got.RowsReceived != 4 {
		t.Fatalf("RowsReceived = %d, want 4", got.RowsReceived)
	}
	if got.DuplicatesRemoved != 1 {
		t.Fatalf("DuplicatesRemoved = %d, want 1", got.DuplicatesRemoved)
	}
	if got.InvalidRows != 1 {
		t.Fatalf("InvalidRows = %d, want 1", got.InvalidRows)
	}
	if len(got.Inputs) != 2 {
		t.Fatalf("len(Inputs) = %d, want 2", len(got.Inputs))
	}

	first := got.Inputs[0]
	if first.TermID != 1265 || first.CourseCode != "cs135" || first.CourseID != 123 || first.Instructor != "Jane Doe" {
		t.Fatalf("first input = %+v, want normalized CS 135 Jane Doe row", first)
	}

	second := got.Inputs[1]
	if second.TermID != 1269 || second.CourseCode != "stat230" || second.Instructor != "John Smith" {
		t.Fatalf("second input = %+v, want normalized STAT 230 John Smith row", second)
	}
}

func TestClassifyMatch(t *testing.T) {
	tests := []struct {
		name  string
		input courseProfessorMatch
		want  matchClassification
	}{
		{
			name: "no existing prof becomes new",
			input: courseProfessorMatch{
				HasFuzzyMatch: false,
			},
			want: matchNew,
		},
		{
			name: "exact name match is existing",
			input: courseProfessorMatch{
				HasFuzzyMatch: true,
				FuzzyScore:    1,
			},
			want: matchExisting,
		},
		{
			name: "strong same-subject match is existing",
			input: courseProfessorMatch{
				HasFuzzyMatch: true,
				FuzzyScore:    0.75,
				SameSubject:   true,
			},
			want: matchExisting,
		},
		{
			name: "strong cross-subject match needs review",
			input: courseProfessorMatch{
				HasFuzzyMatch: true,
				FuzzyScore:    0.75,
				SameSubject:   false,
			},
			want: matchAmbiguous,
		},
		{
			name: "weak same-subject match needs review",
			input: courseProfessorMatch{
				HasFuzzyMatch: true,
				FuzzyScore:    0.4,
				SameSubject:   true,
			},
			want: matchAmbiguous,
		},
		{
			name: "weak cross-subject match becomes new",
			input: courseProfessorMatch{
				HasFuzzyMatch: true,
				FuzzyScore:    0.4,
				SameSubject:   false,
			},
			want: matchNew,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := classifyMatch(tt.input); got != tt.want {
				t.Fatalf("classifyMatch() = %s, want %s", got, tt.want)
			}
		})
	}
}
