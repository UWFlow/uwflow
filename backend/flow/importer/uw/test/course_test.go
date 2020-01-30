package convert_test

import (
	"encoding/json"
	"testing"

	"flow/common/util"
	"flow/importer/uw/parts/course"
)

const easyCourse = `
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
`

const complicatedCourse = `
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
`

func TestConvertCourse(t *testing.T) {
	inputStrings := []string{easyCourse, complicatedCourse}
	inputs := make([]course.ApiCourse, len(inputStrings))
	for i, inputString := range inputStrings {
		json.Unmarshal([]byte(inputString), &inputs[i])
	}

	want := []util.Outcome{
		{
			Value: course.Course{
				Code:        "cs145",
				Name:        "Designing Functional Programs (Advanced Level)",
				Description: "CS 145 is an advanced-level version of CS 135.",
				Prereqs:     "",
				Coreqs:      "",
				Antireqs:    "CS115, CS135, CS137, CS138",
			},
		},
		{
			Value: course.Course{
				Code:        "stat230",
				Name:        "Probability",
				Description: "",
				Prereqs:     "(MATH135 with min. grade of 60% or MATH145)&(MATH128 with min. grade of 70% or (MATH117 or MATH137) with min. grade of 60% or MATH147)); Level at least 1B Hon Math or Math/Phys students only.",
				Coreqs:      "MATH119 or MATH138 or MATH148.",
				Antireqs:    "STAT220, STAT240",
			},
		},
	}

	var converted course.ConvertResult
	err := course.ConvertAll(&converted, inputs)
	if err != nil {
		t.Fatalf("err %s", err)
	}
	for i, got := range converted.Courses {
		want[i].Test(t, inputs[i], got, err)
	}
}

func TestParsePrereqs(t *testing.T) {
	inputs := []string{
		"PHIL/PSYCH 256",
		"RS 305A/333(GRK/RS 233)",
		"RS 285 taken prior to Fall 2008",
		"MATH 235 or 245, 237 or 247.",
	}
	wantstr := []util.Outcome{
		{
			Value: "PHIL256/PSYCH256",
		},
		{
			Value: "RS305A/RS333(GRK233/RS233)",
		},
		{
			Value: "RS285 taken prior to Fall 2008",
		},
		{
			Value: "MATH235 or MATH245, MATH237 or MATH247.",
		},
	}
	wantcourses := []util.Outcome{
		{
			Value: []string{"phil256", "psych256"},
		},
		{
			Value: []string{"rs305a", "rs333", "grk233", "rs233"},
		},
		{
			Value: []string{"rs285"},
		},
		{
			Value: []string{"math235", "math245", "math237", "math247"},
		},
	}
	for i, input := range inputs {
		str, courses := course.ExpandCourseCodes(input)
		wantstr[i].Test(t, input, str, nil)
		wantcourses[i].Test(t, input, courses, nil)
	}
}
