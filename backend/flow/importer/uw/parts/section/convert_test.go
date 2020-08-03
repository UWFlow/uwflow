package section

import (
	"encoding/json"
	"testing"
	"time"

	"flow/importer/uw/parts/term"

	"github.com/google/go-cmp/cmp"
	"github.com/jackc/pgtype"
)

func mustLoadLocation(location string) *time.Location {
	loc, err := time.LoadLocation(location)
	if err != nil {
		panic("no tzdata")
	}
	return loc
}

var est = mustLoadLocation("Canada/Eastern")

func TestConvert(t *testing.T) {
	tests := []struct {
		name  string
		input string
		term  *term.Term
		want  convertResult
	}{
		{
			name: "with_dates",
			input: `
{
  "subject": "BUS",
  "catalog_number": "111W",
  "units": 0.5,
  "title": "Introduction to Business Organization (WLU)",
  "note": null,
  "class_number": 6271,
  "section": "LEC 001",
  "campus": "WLU L",
  "associated_class": 1,
  "related_component_1": null,
  "related_component_2": null,
  "enrollment_capacity": 1000,
  "enrollment_total": 18,
  "waiting_capacity": 0,
  "waiting_total": 0,
  "topic": null,
  "reserves": [
    {
      "reserve_group": "BBA/BMath-BCS Double Degree ",
      "enrollment_capacity": 1000,
      "enrollment_total": 18
    }
  ],
  "classes": [
    {
      "date": {
        "start_time": "08:30",
        "end_time": "09:50",
        "weekdays": "MW",
        "start_date": "09/10",
        "end_date": "12/09",
        "is_tba": false,
        "is_cancelled": false,
        "is_closed": false
      },
      "location": {
        "building": null,
        "room": null
      },
      "instructors": []
    }
  ],
  "held_with": [],
  "term": 1209,
  "academic_level": "undergraduate",
  "last_updated": "2020-08-02T17:04:36-04:00"
}
			`,
			term: &term.Term{
				Id:        1209,
				StartDate: time.Date(2020, 9, 1, 0, 0, 0, 0, time.UTC),
				EndDate:   time.Date(2020, 12, 31, 0, 0, 0, 0, time.UTC),
			},
			want: convertResult{
				Sections: []section{
					{
						CourseCode:         "bus111w",
						ClassNumber:        6271,
						SectionName:        "LEC 001",
						Campus:             "WLU L",
						EnrollmentCapacity: 1000,
						EnrollmentTotal:    18,
						TermId:             1209,
						UpdatedAt:          time.Date(2020, 8, 2, 17, 4, 36, 0, est),
					},
				},
				Meetings: []meeting{
					{
						ClassNumber:  6271,
						TermId:       1209,
						ProfCode:     pgtype.Varchar{Status: pgtype.Null},
						Location:     pgtype.Varchar{Status: pgtype.Null},
						StartSeconds: pgtype.Int4{Int: 30600, Status: pgtype.Present},
						EndSeconds:   pgtype.Int4{Int: 35400, Status: pgtype.Present},
						StartDate:    time.Date(2020, 9, 10, 0, 0, 0, 0, time.UTC),
						EndDate:      time.Date(2020, 12, 9, 0, 0, 0, 0, time.UTC),
						Days:         []string{"M", "W"},
					},
				},
				Profs: profMap{},
			},
		},
		{
			name: "complex",
			input: `
{
  "subject": "ECE",
  "catalog_number": "106",
  "units": 0.5,
  "title": "Electricity and Magnetism",
  "note": "Choose TUT and LAB sections with same Associated Class number as primary meet.",
  "class_number": 4739,
  "section": "LEC 002",
  "campus": "UW U",
  "associated_class": 2,
  "related_component_1": null,
  "related_component_2": null,
  "enrollment_capacity": 141,
  "enrollment_total": 127,
  "waiting_capacity": 0,
  "waiting_total": 0,
  "topic": null,
  "reserves": [
    {
      "reserve_group": "Software Eng Yr 1 students ",
      "enrollment_capacity": 141,
      "enrollment_total": 0
    }
  ],
  "classes": [
    {
      "date": {
        "start_time": "11:30",
        "end_time": "12:20",
        "weekdays": "MWF",
        "start_date": null,
        "end_date": null,
        "is_tba": false,
        "is_cancelled": false,
        "is_closed": false
      },
      "location": {
        "building": "MC",
        "room": "1085"
      },
      "instructors": [
        "Mansour,Firas"
      ]
    },
    {
      "date": {
        "start_time": "13:30",
        "end_time": "14:20",
        "weekdays": "F",
        "start_date": "01/17",
        "end_date": "01/17",
        "is_tba": false,
        "is_cancelled": false,
        "is_closed": false
      },
      "location": {
        "building": "STC",
        "room": "0060"
      },
      "instructors": [
        "Mansour,Firas"
      ]
    },
    {
      "date": {
        "start_time": "13:30",
        "end_time": "14:20",
        "weekdays": "F",
        "start_date": "02/14",
        "end_date": "02/14",
        "is_tba": false,
        "is_cancelled": false,
        "is_closed": false
      },
      "location": {
        "building": "STC",
        "room": "0060"
      },
      "instructors": [
        "Mansour,Firas"
      ]
    },
    {
      "date": {
        "start_time": "13:30",
        "end_time": "14:20",
        "weekdays": "F",
        "start_date": "03/27",
        "end_date": "03/27",
        "is_tba": false,
        "is_cancelled": false,
        "is_closed": false
      },
      "location": {
        "building": "STC",
        "room": "0060"
      },
      "instructors": [
        "Mansour,Firas"
      ]
    },
    {
      "date": {
        "start_time": "13:30",
        "end_time": "14:20",
        "weekdays": "F",
        "start_date": "03/13",
        "end_date": "03/13",
        "is_tba": false,
        "is_cancelled": false,
        "is_closed": false
      },
      "location": {
        "building": "STC",
        "room": "0060"
      },
      "instructors": [
        "Mansour,Firas"
      ]
    },
    {
      "date": {
        "start_time": "14:30",
        "end_time": "15:20",
        "weekdays": "F",
        "start_date": "03/20",
        "end_date": "03/20",
        "is_tba": false,
        "is_cancelled": false,
        "is_closed": false
      },
      "location": {
        "building": "STC",
        "room": "0060"
      },
      "instructors": [
        "Mansour,Firas"
      ]
    }
  ],
  "held_with": [],
  "term": 1201,
  "academic_level": "undergraduate",
  "last_updated": "2020-04-30T23:04:01-04:00"
}
			`,
			term: &term.Term{
				Id:        1201,
				StartDate: time.Date(2020, 1, 1, 0, 0, 0, 0, time.UTC),
				EndDate:   time.Date(2020, 5, 31, 0, 0, 0, 0, time.UTC),
			},
			want: convertResult{
				Sections: []section{
					{
						CourseCode:         "ece106",
						ClassNumber:        4739,
						SectionName:        "LEC 002",
						Campus:             "UW U",
						EnrollmentCapacity: 141,
						EnrollmentTotal:    127,
						TermId:             1201,
						UpdatedAt:          time.Date(2020, 4, 30, 23, 4, 1, 0, est),
					},
				},
				Meetings: []meeting{
					{
						ClassNumber:  4739,
						TermId:       1201,
						ProfCode:     pgtype.Varchar{String: "firas_mansour", Status: pgtype.Present},
						Location:     pgtype.Varchar{String: "MC 1085", Status: pgtype.Present},
						StartSeconds: pgtype.Int4{Int: 41400, Status: pgtype.Present},
						EndSeconds:   pgtype.Int4{Int: 44400, Status: pgtype.Present},
						StartDate:    time.Date(2020, 1, 1, 0, 0, 0, 0, time.UTC),
						EndDate:      time.Date(2020, 5, 31, 0, 0, 0, 0, time.UTC),
						Days:         []string{"M", "W", "F"},
					},
					{
						ClassNumber:  4739,
						TermId:       1201,
						ProfCode:     pgtype.Varchar{String: "firas_mansour", Status: pgtype.Present},
						Location:     pgtype.Varchar{String: "STC 0060", Status: pgtype.Present},
						StartSeconds: pgtype.Int4{Int: 48600, Status: pgtype.Present},
						EndSeconds:   pgtype.Int4{Int: 51600, Status: pgtype.Present},
						StartDate:    time.Date(2020, 1, 17, 0, 0, 0, 0, time.UTC),
						EndDate:      time.Date(2020, 1, 17, 0, 0, 0, 0, time.UTC),
						Days:         []string{"F"},
					},
					{
						ClassNumber:  4739,
						TermId:       1201,
						ProfCode:     pgtype.Varchar{String: "firas_mansour", Status: pgtype.Present},
						Location:     pgtype.Varchar{String: "STC 0060", Status: pgtype.Present},
						StartSeconds: pgtype.Int4{Int: 48600, Status: pgtype.Present},
						EndSeconds:   pgtype.Int4{Int: 51600, Status: pgtype.Present},
						StartDate:    time.Date(2020, 2, 14, 0, 0, 0, 0, time.UTC),
						EndDate:      time.Date(2020, 2, 14, 0, 0, 0, 0, time.UTC),
						Days:         []string{"F"},
					},
					{
						ClassNumber:  4739,
						TermId:       1201,
						ProfCode:     pgtype.Varchar{String: "firas_mansour", Status: pgtype.Present},
						Location:     pgtype.Varchar{String: "STC 0060", Status: pgtype.Present},
						StartSeconds: pgtype.Int4{Int: 48600, Status: pgtype.Present},
						EndSeconds:   pgtype.Int4{Int: 51600, Status: pgtype.Present},
						StartDate:    time.Date(2020, 3, 27, 0, 0, 0, 0, time.UTC),
						EndDate:      time.Date(2020, 3, 27, 0, 0, 0, 0, time.UTC),
						Days:         []string{"F"},
					},
					{
						ClassNumber:  4739,
						TermId:       1201,
						ProfCode:     pgtype.Varchar{String: "firas_mansour", Status: pgtype.Present},
						Location:     pgtype.Varchar{String: "STC 0060", Status: pgtype.Present},
						StartSeconds: pgtype.Int4{Int: 48600, Status: pgtype.Present},
						EndSeconds:   pgtype.Int4{Int: 51600, Status: pgtype.Present},
						StartDate:    time.Date(2020, 3, 13, 0, 0, 0, 0, time.UTC),
						EndDate:      time.Date(2020, 3, 13, 0, 0, 0, 0, time.UTC),
						Days:         []string{"F"},
					},
					{
						ClassNumber:  4739,
						TermId:       1201,
						ProfCode:     pgtype.Varchar{String: "firas_mansour", Status: pgtype.Present},
						Location:     pgtype.Varchar{String: "STC 0060", Status: pgtype.Present},
						StartSeconds: pgtype.Int4{Int: 52200, Status: pgtype.Present},
						EndSeconds:   pgtype.Int4{Int: 55200, Status: pgtype.Present},
						StartDate:    time.Date(2020, 3, 20, 0, 0, 0, 0, time.UTC),
						EndDate:      time.Date(2020, 3, 20, 0, 0, 0, 0, time.UTC),
						Days:         []string{"F"},
					},
				},
				Profs: profMap{
					"firas_mansour": "Firas Mansour",
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var section apiSection
			var got convertResult

			json.Unmarshal([]byte(tt.input), &section)
			err := convertAll(&got, []apiSection{section}, tt.term)
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
