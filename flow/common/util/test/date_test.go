package test

import (
	"testing"

	"flow/common/util"
)

func TestTimeStringToSeconds(t *testing.T) {
	inputs := []string{
		"2021-05-12T06:40:00", "2021-05-12T18:00:00",
		"2021-05-12T12:30:00", "2021-05-12T00:15:00",
		"08:30 04-05-2019", "12:30 AM", "",
	}
	want := []util.Outcome{
		{Value: 24000}, {Value: 64800}, {Value: 45000}, {Value: 900},
		{Error: true}, {Error: true}, {Error: true},
	}
	for i, input := range inputs {
		got, err := util.TimeStringToSeconds(input)
		want[i].Test(t, input, got, err)
	}
}

func TestParseWeekdayString(t *testing.T) {
	inputs := []string{
		"", "NNNNNNN", "YNNNNNN", "NNNYNNN", "YNYNYNN", "NYNYNNN", "YYYYYYY",
	}
	want := []util.Outcome{
		{Value: []string{}},
		{Value: []string{}},
		{Value: []string{"M"}},
		{Value: []string{"Th"}},
		{Value: []string{"M", "W", "F"}},
		{Value: []string{"T", "Th"}},
		{Value: []string{"M", "T", "W", "Th", "F", "S", "Su"}},
	}
	for i, input := range inputs {
		got := util.ParseWeekdayString(input)
		want[i].Test(t, input, got, nil)
	}
}
