package convert_test

import (
	"encoding/json"
	"testing"

	"flow/importer/uw/parts/course"

	"github.com/google/go-cmp/cmp"
	"github.com/jackc/pgtype"
)

func TestConvertCourse(t *testing.T) {
	tests := []struct {
		name  string
		input string
		want  course.ConvertResult
	}{
		{
			"simple",
			`
{
  "course_id": "012767",
  "subject": "CS",
  "catalog_number": "145",
  "title": "Designing Functional Programs (Advanced Level)",
  "description": "CS 145 is an advanced-level version of CS 135.",
  "prerequisites": null,
  "antirequisites": "CS 115, 135, 137, 138",
  "corequisites": null
}
			`,
			course.ConvertResult{
				Courses: []course.Course{
					{
						Code: "cs145",
						Name: "Designing Functional Programs (Advanced Level)",
						Description: pgtype.Varchar{
							String: "CS 145 is an advanced-level version of CS 135.",
							Status: pgtype.Present,
						},
						Prereqs: pgtype.Varchar{Status: pgtype.Null},
						Coreqs:  pgtype.Varchar{Status: pgtype.Null},
						Antireqs: pgtype.Varchar{
							String: "CS115, CS135, CS137, CS138",
							Status: pgtype.Present,
						},
					},
				},
				Antireqs: []course.Antireq{
					{
						CourseCode:  "cs145",
						AntireqCode: "cs115",
					},
					{
						CourseCode:  "cs145",
						AntireqCode: "cs135",
					},
					{
						CourseCode:  "cs145",
						AntireqCode: "cs137",
					},
					{
						CourseCode:  "cs145",
						AntireqCode: "cs138",
					},
				},
			},
		},
		{
			"complex",
			`
{
  "course_id": "008864",
  "subject": "STAT",
  "catalog_number": "230",
  "title": "Probability",
  "description": null,
  "prerequisites": "(MATH 135 with min. grade of 60% or MATH 145)&(MATH 128 with min. grade of 70% or (MATH 117 or 137) with min. grade of 60% or MATH 147)); Level at least 1B Hon Math or Math/Phys students only.",
  "antirequisites": "STAT 220, 240",
  "corequisites": "MATH 119 or 138 or 148."
}
			`,
			course.ConvertResult{
				Courses: []course.Course{
					{
						Code:        "stat230",
						Name:        "Probability",
						Description: pgtype.Varchar{Status: pgtype.Null},
						Prereqs: pgtype.Varchar{
							String: "(MATH135 with min. grade of 60% or MATH145)&(MATH128 with min. grade of 70% or (MATH117 or MATH137) with min. grade of 60% or MATH147)); Level at least 1B Hon Math or Math/Phys students only.",
							Status: pgtype.Present,
						},
						Coreqs: pgtype.Varchar{
							String: "MATH119 or MATH138 or MATH148.",
							Status: pgtype.Present,
						},
						Antireqs: pgtype.Varchar{
							String: "STAT220, STAT240",
							Status: pgtype.Present,
						},
					},
				},
				Prereqs: []course.Prereq{
					{
						CourseCode: "stat230",
						PrereqCode: "math135",
					},
					{
						CourseCode: "stat230",
						PrereqCode: "math145",
					},
					{
						CourseCode: "stat230",
						PrereqCode: "math128",
					},
					{
						CourseCode: "stat230",
						PrereqCode: "math117",
					},
					{
						CourseCode: "stat230",
						PrereqCode: "math137",
					},
					{
						CourseCode: "stat230",
						PrereqCode: "math147",
					},
					{
						CourseCode: "stat230",
						PrereqCode: "math119",
						IsCoreq:    true,
					},
					{
						CourseCode: "stat230",
						PrereqCode: "math138",
						IsCoreq:    true,
					},
					{
						CourseCode: "stat230",
						PrereqCode: "math148",
						IsCoreq:    true,
					},
				},
				Antireqs: []course.Antireq{
					{
						CourseCode:  "stat230",
						AntireqCode: "stat220",
					},
					{
						CourseCode:  "stat230",
						AntireqCode: "stat240",
					},
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var apiCourse course.ApiCourse
			var got course.ConvertResult

			json.Unmarshal([]byte(tt.input), &apiCourse)
			err := course.ConvertAll(&got, []course.ApiCourse{apiCourse})
			if err != nil {
				t.Errorf("error: %v", err)
			}
			if !cmp.Equal(tt.want, got) {
				diff := cmp.Diff(tt.want, got)
				t.Errorf("mismatch (-want +got):\n%s", diff)
			}
		})
	}
}

func TestParsePrereqs(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		wantStr  string
		wantList []string
	}{
		{
			"two_subjects",
			"PHIL/PSYCH 256",
			"PHIL256/PSYCH256",
			[]string{"phil256", "psych256"},
		},
		{
			"two_groups",
			"RS 305A/333(GRK/RS 233)",
			"RS305A/RS333(GRK233/RS233)",
			[]string{"rs305a", "rs333", "grk233", "rs233"},
		},
		{
			"year_in_text",
			"RS 285 taken prior to Fall 2008",
			"RS285 taken prior to Fall 2008",
			[]string{"rs285"},
		},
		{
			"conjunctions",
			"MATH 235 or 245, 237 or 247.",
			"MATH235 or MATH245, MATH237 or MATH247.",
			[]string{"math235", "math245", "math237", "math247"},
		},
		{
			"complex",
			"One of ECON 221, STAT 211, 231, 241; AFM 241 or CS 330; Accounting and Financial Management, Mathematics/CPA, or Biotechnology/CPA students.",
			"One of ECON221, STAT211, STAT231, STAT241; AFM241 or CS330; Accounting and Financial Management, Mathematics/CPA, or Biotechnology/CPA students.",
			[]string{"econ221", "stat211", "stat231", "stat241", "afm241", "cs330"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			str, list := course.ExpandCourseCodes(tt.input)
			if tt.wantStr != str {
				t.Errorf("string %q; want %q", str, tt.wantStr)
			}
			if !cmp.Equal(tt.wantList, list) {
				diff := cmp.Diff(tt.wantList, list)
				t.Errorf("list mismatch (-want +got):\n%s", diff)
			}
		})
	}
}
