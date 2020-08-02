package section

import (
	"encoding/json"
	"testing"
	"time"

	"flow/importer/uw/parts/term"

	"github.com/google/go-cmp/cmp"
	"github.com/jackc/pgtype"
)

const sectionWithDates = `
}`

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
		want  convertResult
	}{
		{
			"with_dates",
			`
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
			convertResult{
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
						IsCancelled:  false,
						IsClosed:     false,
						IsTba:        false,
					},
				},
				Profs: nil,
			},
		},
	}

	term := &term.Term{
		Id:        1209,
		StartDate: time.Date(2020, 9, 1, 0, 0, 0, 0, time.UTC),
		EndDate:   time.Date(2020, 12, 31, 0, 0, 0, 0, time.UTC),
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var section apiSection
			var got convertResult

			json.Unmarshal([]byte(tt.input), &section)
			err := convertAll(&got, []apiSection{section}, term)
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
