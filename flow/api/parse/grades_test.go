package parse

import (
	"testing"

	"flow/api/parse/transcript"

	"github.com/google/go-cmp/cmp"
)

func TestGradeRows(t *testing.T) {
	summary := &transcript.Summary{
		TermSummaries: []transcript.TermSummary{
			// A co-op term before any courses with marks.
			{TermId: 1175, Level: "1A", Courses: []string{"coop0"}, Grades: []string{"CR"}, TermGPA: "0.00", CumulativeGPA: "0.00"},
			{
				TermId: 1179, Level: "1A",
				Courses: []string{"cs145", "pd1"}, Grades: []string{"97", "CR"},
				TermGPA: "97.00", CumulativeGPA: "97.00",
			},
			{TermId: 1185, Level: "2A", Courses: []string{"coop1"}, Grades: []string{"CR"}, TermGPA: "0.00", CumulativeGPA: "97.00"},
			// In progress.
			{TermId: 1189, Level: "2A", Courses: []string{"cs246"}, Grades: []string{""}},
		},
	}

	grades, gpas := gradeRows(summary)

	mark := 97
	wantGrades := []courseGrade{
		{code: "coop0", termId: 1175, grade: "CR"},
		{code: "cs145", termId: 1179, grade: "97", mark: &mark},
		{code: "pd1", termId: 1179, grade: "CR"},
		{code: "coop1", termId: 1185, grade: "CR"},
	}
	if diff := cmp.Diff(wantGrades, grades, cmp.AllowUnexported(courseGrade{})); diff != "" {
		t.Errorf("grades mismatch (-want +got):\n%s", diff)
	}

	gpa := "97.00"
	wantGPAs := []termGPA{
		{termId: 1175, level: "1A"},
		{termId: 1179, level: "1A", termGPA: &gpa, cumulativeGPA: &gpa},
		{termId: 1185, level: "2A", cumulativeGPA: &gpa},
		{termId: 1189, level: "2A"},
	}
	if diff := cmp.Diff(wantGPAs, gpas, cmp.AllowUnexported(termGPA{})); diff != "" {
		t.Errorf("GPAs mismatch (-want +got):\n%s", diff)
	}
}
