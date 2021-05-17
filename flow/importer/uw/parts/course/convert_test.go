package course

import (
	"encoding/json"
	"flow/importer/uw/parts/term"
	"testing"
	"time"

	"github.com/google/go-cmp/cmp"
	"github.com/google/go-cmp/cmp/cmpopts"
	"github.com/jackc/pgtype"
)

func TestConvertCourse(t *testing.T) {
	tests := []struct {
		name  string
		input string
		want  convertResult
	}{
		{
			"simple",
			`
{
    "subjectCode": "CS",
    "catalogNumber": "145",
    "title": "Designing Functional Programs (Advanced Level)",
    "description": "CS 145 is an advanced-level version of CS 135.",
    "requirementsDescription": "Antireq: CS 115, 135, 137, 138"
}
			`,
			convertResult{
				Courses: []course{
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
				Antireqs: []antireq{
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
    "subjectCode": "STAT",
    "catalogNumber": "230",
    "title": "Probability",
    "description": "This course provides an introduction to probability models including sample spaces, mutually exclusive and independent events, conditional probability and Bayes' Theorem. The named distributions (Discrete Uniform, Hypergeometric, Binomial, Negative Binomial, Geometric, Poisson, Continuous Uniform, Exponential, Normal (Gaussian), and Multinomial) are used to model real phenomena. Discrete and continuous univariate random variables and their distributions are discussed. Joint probability functions, marginal probability functions, and conditional probability functions of two or more discrete random variables and functions of random variables are also discussed. Students learn how to calculate and interpret means, variances and covariances particularly for the named distributions. The Central Limit Theorem is used to approximate probabilities. [Note: Many upper-year Statistics courses require a grade of at least 60% in STAT 230. Offered: F,W,S]",
    "requirementsDescription": "Prereq: ((One of MATH 116, 117, 137, 147) with a minimum grade of 80%) or (MATH 128 with a minimum grade of 60%) or (one of MATH 118, 119, 138, 148); Honours Math or Math/Phys students only. Antireq: STAT 220, 240"
}
			`,
			convertResult{
				Courses: []course{
					{
						Code: "stat230",
						Name: "Probability",
						Description: pgtype.Varchar{
							String: "This course provides an introduction to probability models including sample spaces, mutually exclusive and independent events, conditional probability and Bayes' Theorem. The named distributions (Discrete Uniform, Hypergeometric, Binomial, Negative Binomial, Geometric, Poisson, Continuous Uniform, Exponential, Normal (Gaussian), and Multinomial) are used to model real phenomena. Discrete and continuous univariate random variables and their distributions are discussed. Joint probability functions, marginal probability functions, and conditional probability functions of two or more discrete random variables and functions of random variables are also discussed. Students learn how to calculate and interpret means, variances and covariances particularly for the named distributions. The Central Limit Theorem is used to approximate probabilities. [Note: Many upper-year Statistics courses require a grade of at least 60% in STAT 230. Offered: F,W,S]",
							Status: pgtype.Present,
						},
						Prereqs: pgtype.Varchar{
							String: "((One of MATH116, MATH117, MATH137, MATH147) with a minimum grade of 80%) or (MATH128 with a minimum grade of 60%) or (one of MATH118, MATH119, MATH138, MATH148); Honours Math or Math/Phys students only.",
							Status: pgtype.Present,
						},
						Coreqs: pgtype.Varchar{Status: pgtype.Null},
						Antireqs: pgtype.Varchar{
							String: "STAT220, STAT240",
							Status: pgtype.Present,
						},
					},
				},
				Prereqs: []prereq{
					{
						CourseCode: "stat230",
						PrereqCode: "math116",
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
						PrereqCode: "math128",
					},
					{
						CourseCode: "stat230",
						PrereqCode: "math118",
					},
					{
						CourseCode: "stat230",
						PrereqCode: "math119",
					},
					{
						CourseCode: "stat230",
						PrereqCode: "math138",
					},
					{
						CourseCode: "stat230",
						PrereqCode: "math148",
					},
				},
				Antireqs: []antireq{
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
			var course apiCourse
			var got convertResult

			json.Unmarshal([]byte(tt.input), &course)
			err := convertCourse(&got, &course)
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

func TestConvertSection(t *testing.T) {
	tests := []struct {
		name       string
		input      string
		courseCode string
		term       *term.Term
		want       convertResult
	}{
		{
			"simple_one_meeting",
			`
{
	"classSection": 54,
	"termCode": "1215",
	"classNumber": 3533,
	"courseComponent": "LEC",
	"maxEnrollmentCapacity": 1070,
	"enrolledStudents": 30,
	"scheduleData": [
		{
			"classMeetingNumber": 1,
			"scheduleStartDate": "2021-05-10T00:00:00",
			"scheduleEndDate": "2021-08-04T00:00:00",
			"classMeetingStartTime": "2021-05-13T18:30:00",
			"classMeetingEndTime": "2021-05-13T21:20:00",
			"classMeetingWeekPatternCode": "NYNNNNN",
			"locationName": "Spring 2021"
		}
	],
	"instructorData": null
}
						  `,
			"bus111w",
			&term.Term{
				Id:        1215,
				StartDate: time.Date(2021, 5, 1, 0, 0, 0, 0, time.UTC),
				EndDate:   time.Date(2021, 8, 31, 0, 0, 0, 0, time.UTC),
			},
			convertResult{
				Sections: []section{
					{
						CourseCode:         "bus111w",
						ClassNumber:        3533,
						SectionName:        "LEC 054",
						EnrollmentCapacity: 1070,
						EnrollmentTotal:    30,
						TermId:             1215,
						UpdatedAt:          time.Now(),
					},
				},
				Meetings: []meeting{
					{
						ClassNumber: 3533,
						TermId:      1215,
						ProfCode:    pgtype.Varchar{Status: pgtype.Null},
						Location: pgtype.Varchar{
							String: "Online",
							Status: pgtype.Present,
						},
						StartSeconds: pgtype.Int4{Int: 66600, Status: pgtype.Present},
						EndSeconds:   pgtype.Int4{Int: 76800, Status: pgtype.Present},
						StartDate:    time.Date(2021, 5, 10, 0, 0, 0, 0, time.UTC),
						EndDate:      time.Date(2021, 8, 4, 0, 0, 0, 0, time.UTC),
						Days:         []string{"T"},
					},
				},
			},
		},
		{
			"invalid_section",
			`
{
	"classSection": 701,
	"termCode": "1215",
	"classNumber": 1692,
	"courseComponent": "LEC",
	"maxEnrollmentCapacity": 9999,
	"enrolledStudents": 0,
	"scheduleData": [
		{
			"classMeetingNumber": 0,
			"scheduleStartDate": "0001-01-01T00:00:00",
			"scheduleEndDate": "0001-01-01T00:00:00",
			"classMeetingStartTime": "0001-01-01T00:00:00",
			"classMeetingEndTime": "0001-01-01T00:00:00",
			"classMeetingWeekPatternCode": "",
			"locationName": null
		}
	],
	"instructorData": null
}			
			`,
			"",
			&term.Term{
				Id:        1215,
				StartDate: time.Date(2021, 5, 1, 0, 0, 0, 0, time.UTC),
				EndDate:   time.Date(2021, 8, 31, 0, 0, 0, 0, time.UTC),
			},
			convertResult{},
		},
		{
			"complex",
			`
{
	"classSection": 241,
	"termCode": "1215",
	"classNumber": 2811,
	"courseComponent": "LAB",
	"maxEnrollmentCapacity": 50,
	"enrolledStudents": 54,
	"scheduleData": [
		{
			"classMeetingNumber": 1,
			"scheduleStartDate": "2021-05-20T00:00:00",
			"scheduleEndDate": "2021-05-20T00:00:00",
			"classMeetingStartTime": "2021-05-13T08:30:00",
			"classMeetingEndTime": "2021-05-13T11:20:00",
			"classMeetingWeekPatternCode": "NNNYNNN",
			"locationName": "Spring 2021"
		},
		{
			"classMeetingNumber": 2,
			"scheduleStartDate": "2021-06-03T00:00:00",
			"scheduleEndDate": "2021-06-03T00:00:00",
			"classMeetingStartTime": "2021-05-13T08:30:00",
			"classMeetingEndTime": "2021-05-13T11:20:00",
			"classMeetingWeekPatternCode": "NNNYNNN",
			"locationName": "Spring 2021"
		},
		{
			"classMeetingNumber": 3,
			"scheduleStartDate": "2021-06-17T00:00:00",
			"scheduleEndDate": "2021-06-17T00:00:00",
			"classMeetingStartTime": "2021-05-13T08:30:00",
			"classMeetingEndTime": "2021-05-13T11:20:00",
			"classMeetingWeekPatternCode": "NNNYNNN",
			"locationName": "Spring 2021"
		},
		{
			"classMeetingNumber": 4,
			"scheduleStartDate": "2021-07-08T00:00:00",
			"scheduleEndDate": "2021-07-08T00:00:00",
			"classMeetingStartTime": "2021-05-13T08:30:00",
			"classMeetingEndTime": "2021-05-13T11:20:00",
			"classMeetingWeekPatternCode": "NNNYNNN",
			"locationName": "Spring 2021"
		},
		{
			"classMeetingNumber": 5,
			"scheduleStartDate": "2021-07-22T00:00:00",
			"scheduleEndDate": "2021-07-22T00:00:00",
			"classMeetingStartTime": "2021-05-13T08:30:00",
			"classMeetingEndTime": "2021-05-13T11:20:00",
			"classMeetingWeekPatternCode": "NNNYNNN",
			"locationName": "MC 1085"
		}
	],
	"instructorData": null
}
				`,
			"ece106",
			&term.Term{
				Id:        1215,
				StartDate: time.Date(2021, 5, 1, 0, 0, 0, 0, time.UTC),
				EndDate:   time.Date(2021, 8, 31, 0, 0, 0, 0, time.UTC),
			},
			convertResult{
				Sections: []section{
					{
						CourseCode:         "ece106",
						ClassNumber:        2811,
						SectionName:        "LAB 241",
						EnrollmentCapacity: 50,
						EnrollmentTotal:    54,
						TermId:             1215,
						UpdatedAt:          time.Now(),
					},
				},
				Meetings: []meeting{
					{
						ClassNumber: 2811,
						TermId:      1215,
						ProfCode:    pgtype.Varchar{Status: pgtype.Null},
						Location: pgtype.Varchar{
							String: "Online",
							Status: pgtype.Present,
						},
						StartSeconds: pgtype.Int4{Int: 30600, Status: pgtype.Present},
						EndSeconds:   pgtype.Int4{Int: 40800, Status: pgtype.Present},
						StartDate:    time.Date(2021, 5, 20, 0, 0, 0, 0, time.UTC),
						EndDate:      time.Date(2021, 5, 20, 0, 0, 0, 0, time.UTC),
						Days:         []string{"Th"},
					},
					{
						ClassNumber: 2811,
						TermId:      1215,
						ProfCode:    pgtype.Varchar{Status: pgtype.Null},
						Location: pgtype.Varchar{
							String: "Online",
							Status: pgtype.Present,
						},
						StartSeconds: pgtype.Int4{Int: 30600, Status: pgtype.Present},
						EndSeconds:   pgtype.Int4{Int: 40800, Status: pgtype.Present},
						StartDate:    time.Date(2021, 6, 3, 0, 0, 0, 0, time.UTC),
						EndDate:      time.Date(2021, 6, 3, 0, 0, 0, 0, time.UTC),
						Days:         []string{"Th"},
					},
					{
						ClassNumber: 2811,
						TermId:      1215,
						ProfCode:    pgtype.Varchar{Status: pgtype.Null},
						Location: pgtype.Varchar{
							String: "Online",
							Status: pgtype.Present,
						},
						StartSeconds: pgtype.Int4{Int: 30600, Status: pgtype.Present},
						EndSeconds:   pgtype.Int4{Int: 40800, Status: pgtype.Present},
						StartDate:    time.Date(2021, 6, 17, 0, 0, 0, 0, time.UTC),
						EndDate:      time.Date(2021, 6, 17, 0, 0, 0, 0, time.UTC),
						Days:         []string{"Th"},
					},
					{
						ClassNumber: 2811,
						TermId:      1215,
						ProfCode:    pgtype.Varchar{Status: pgtype.Null},
						Location: pgtype.Varchar{
							String: "Online",
							Status: pgtype.Present,
						},
						StartSeconds: pgtype.Int4{Int: 30600, Status: pgtype.Present},
						EndSeconds:   pgtype.Int4{Int: 40800, Status: pgtype.Present},
						StartDate:    time.Date(2021, 7, 8, 0, 0, 0, 0, time.UTC),
						EndDate:      time.Date(2021, 7, 8, 0, 0, 0, 0, time.UTC),
						Days:         []string{"Th"},
					},
					{
						ClassNumber: 2811,
						TermId:      1215,
						ProfCode:    pgtype.Varchar{Status: pgtype.Null},
						Location: pgtype.Varchar{
							String: "MC 1085",
							Status: pgtype.Present,
						},
						StartSeconds: pgtype.Int4{Int: 30600, Status: pgtype.Present},
						EndSeconds:   pgtype.Int4{Int: 40800, Status: pgtype.Present},
						StartDate:    time.Date(2021, 7, 22, 0, 0, 0, 0, time.UTC),
						EndDate:      time.Date(2021, 7, 22, 0, 0, 0, 0, time.UTC),
						Days:         []string{"Th"},
					},
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var class apiClass
			var got convertResult

			json.Unmarshal([]byte(tt.input), &class)
			class.CourseCode = tt.courseCode
			err := convertSection(&got, &class, tt.term)
			if err != nil {
				t.Errorf("error: %v", err)
			}
			ignoreOpt := cmpopts.IgnoreFields(section{}, "UpdatedAt")
			if !cmp.Equal(tt.want, got, ignoreOpt) {
				diff := cmp.Diff(tt.want, got, ignoreOpt)
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
			str, list := expandCourseCodes(tt.input)
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

func TestParseRequirements(t *testing.T) {
	tests := []struct {
		name         string
		input        string
		wantPrereqs  string
		wantCoreqs   string
		wantAntireqs string
	}{
		{
			"empty",
			"",
			"",
			"",
			"",
		},
		{
			"prereq_only",
			"Prereq: Level at least 3A Honours Philosophy students",
			"Level at least 3A Honours Philosophy students",
			"",
			"",
		},
		{
			"antireq_only",
			"Antireq: PHIL 209 taken winter 2015, fall 2015",
			"",
			"",
			"PHIL 209 taken winter 2015, fall 2015",
		},
		{
			"prereq_coreq",
			"Prereq: ECE 106, 140, MATH 119; Level at least 2A Computer Engineering or Electrical Engineering. Coreq: (ECE 205 or MATH 211)",
			"ECE 106, 140, MATH 119; Level at least 2A Computer Engineering or Electrical Engineering.",
			"(ECE 205 or MATH 211)",
			"",
		},
		{
			"all_reqs",
			"Prereq: ECE 240, (ECE 205 or MATH 211); Level at least 2B Computer Engineering or Electrical Engineering. Coreq: ECE 207. Antireq: ECE 340",
			"ECE 240, (ECE 205 or MATH 211); Level at least 2B Computer Engineering or Electrical Engineering.",
			"ECE 207.",
			"ECE 340",
		},
		{
			"combined_prereq_coreq",
			"Prereq/coreq: ECE 650 or 750 Tpc 26 or instructor consent. Antireq: CS 447, 647, ECE 453, SE 465",
			"ECE 650 or 750 Tpc 26 or instructor consent.",
			"",
			"CS 447, 647, ECE 453, SE 465",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			prereqs, coreqs, antireqs, _ := parseCourseRequirements(&tt.input)
			if tt.wantPrereqs != prereqs {
				t.Errorf("prereqs %q; want %q", prereqs, tt.wantPrereqs)
			}
			if tt.wantCoreqs != coreqs {
				t.Errorf("coreqs %q; want %q", coreqs, tt.wantCoreqs)
			}
			if tt.wantAntireqs != antireqs {
				t.Errorf("antireqs %q; want %q", antireqs, tt.wantAntireqs)
			}
		})
	}
}
