package convert_test

import (
	"encoding/json"
	"testing"
	"time"

	"flow/common/util"
	"flow/importer/uw/parts/exam"
)

const emptyExam = `
{
  "course": "BUS 482W",
  "sections": [
    {
      "section": "",
      "day": "",
      "date": "1969-12-31",
      "start_time": "",
      "end_time": "",
      "location": "",
      "notes": "See https://students.wlu.ca/academics/exams/exam-schedules/index.html"
    }
  ]
}
`

const separateExam = `
{
  "course": "ACTSC 372",
  "sections": [
    {
      "section": "001,003",
      "day": "Tuesday",
      "date": "2019-12-10",
      "start_time": "12:30 PM",
      "end_time": "3:00 PM",
      "location": "M3 1006",
      "notes": ""
    },
    {
      "section": "002",
      "day": "Tuesday",
      "date": "2019-12-10",
      "start_time": "12:30 PM",
      "end_time": "3:00 PM",
      "location": "PAC 1",
      "notes": ""
    }
  ]
}
`

const rangeExam = `
{
  "course":"CS 350",
  "sections": [
    {
      "section":"001-002",
      "day":"Thursday",
      "date":"2019-12-12",
      "start_time":"7:30 PM",
      "end_time":"10:00 PM",
      "location":"PAC 1, 2, 3",
      "notes":""
    }
  ]
}
`

func TestConvertExam(t *testing.T) {
	inputStrings := []string{rangeExam, separateExam}
	inputs := make([]exam.ApiExam, len(inputStrings))
	for i, inputString := range inputStrings {
		json.Unmarshal([]byte(inputString), &inputs[i])
	}
	want := []util.Outcome{
		//{Value: []exam.Exam{}},
		{
			Value: []exam.Exam{
				{
					CourseCode:   "cs350",
					SectionName:  "LEC 001",
					Term:         1199,
					Location:     util.StringToPointer("PAC 1, 2, 3"),
					StartSeconds: util.IntToPointer(70200),
					EndSeconds:   util.IntToPointer(79200),
					Day:          util.StringToPointer("Th"),
					Date:         util.TimeToPointer(time.Date(2019, 12, 12, 0, 0, 0, 0, time.UTC)),
					IsTba:        false,
				},
				{
					CourseCode:   "cs350",
					SectionName:  "LEC 002",
					Term:         1199,
					Location:     util.StringToPointer("PAC 1, 2, 3"),
					StartSeconds: util.IntToPointer(70200),
					EndSeconds:   util.IntToPointer(79200),
					Day:          util.StringToPointer("Th"),
					Date:         util.TimeToPointer(time.Date(2019, 12, 12, 0, 0, 0, 0, time.UTC)),
					IsTba:        false,
				},
			},
		},
		{
			Value: []exam.Exam{
				{
					CourseCode:   "actsc372",
					SectionName:  "LEC 001",
					Term:         1199,
					Location:     util.StringToPointer("M3 1006"),
					StartSeconds: util.IntToPointer(45000),
					EndSeconds:   util.IntToPointer(54000),
					Day:          util.StringToPointer("T"),
					Date:         util.TimeToPointer(time.Date(2019, 12, 10, 0, 0, 0, 0, time.UTC)),
					IsTba:        false,
				},
				{
					CourseCode:   "actsc372",
					SectionName:  "LEC 003",
					Term:         1199,
					Location:     util.StringToPointer("M3 1006"),
					StartSeconds: util.IntToPointer(45000),
					EndSeconds:   util.IntToPointer(54000),
					Day:          util.StringToPointer("T"),
					Date:         util.TimeToPointer(time.Date(2019, 12, 10, 0, 0, 0, 0, time.UTC)),
					IsTba:        false,
				},
				{
					CourseCode:   "actsc372",
					SectionName:  "LEC 002",
					Term:         1199,
					Location:     util.StringToPointer("PAC 1"),
					StartSeconds: util.IntToPointer(45000),
					EndSeconds:   util.IntToPointer(54000),
					Day:          util.StringToPointer("T"),
					Date:         util.TimeToPointer(time.Date(2019, 12, 10, 0, 0, 0, 0, time.UTC)),
					IsTba:        false,
				},
			},
		},
	}
	for i, input := range inputs {
		got, err := exam.Convert(&input, 1199)
		want[i].Test(t, input, got, err)
	}
}
