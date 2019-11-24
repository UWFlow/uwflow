package test

import (
	"testing"
	"time"

	"flow/common/util"
)

func TestDateToWeekdayCode(t *testing.T) {
	want := []string{"M", "T", "W", "Th", "F", "S", "Su"}
	base := time.Date(2019, 10, 7, 21, 42, 57, 0, time.UTC)
	for i := 0; i < 7; i++ {
		input := base.AddDate(0, 0, i)
		got := util.DateToWeekdayCode(input)
		if got != want[i] {
			t.Fatalf("For: %v; got: %v; want: %v\n", input, got, want[i])
		}
	}
}

func TestMonthDayToDate(t *testing.T) {
	inputs := []struct {
		string
		int
	}{
		{"10/07", 1199}, {"12/31", 1201}, {"01/02", 995},
		{"30/05", 1995}, {"04/15", 0},
	}
	want := []util.Outcome{
		{Value: time.Date(2019, 10, 7, 0, 0, 0, 0, time.UTC)},
		{Value: time.Date(2020, 12, 31, 0, 0, 0, 0, time.UTC)},
		{Value: time.Date(1999, 01, 02, 0, 0, 0, 0, time.UTC)},
		{Error: true},
		{Error: true},
	}
	for i, input := range inputs {
		got, err := util.MonthDayToDate(input.string, input.int)
		want[i].Test(t, input, got, err)
	}
}

func TestTimeString24HToSeconds(t *testing.T) {
	inputs := []string{
		"06:40", "18:00", "12:30", "00:15",
		"08:30 04-05-2019", "12:30 AM", "",
	}
	want := []util.Outcome{
		{Value: 24000}, {Value: 64800}, {Value: 45000}, {Value: 900},
		{Error: true}, {Error: true}, {Error: true},
	}
	for i, input := range inputs {
		got, err := util.TimeString24HToSeconds(input)
		want[i].Test(t, input, got, err)
	}
}

func TestTimeString12HToSeconds(t *testing.T) {
	inputs := []string{
		"06:40 AM", "06:40 PM", "12:30 AM", "12:30 PM",
		"06:40", "12:30AM", "12:30 am", "12 AM",
		"12:30 ", " AM", "12:30AM PM", "12:30 AMPM",
	}
	want := []util.Outcome{
		{Value: 24000}, {Value: 67200}, {Value: 1800}, {Value: 45000},
		{Error: true}, {Error: true}, {Error: true}, {Error: true},
		{Error: true}, {Error: true}, {Error: true}, {Error: true},
	}
	for i, input := range inputs {
		got, err := util.TimeString12HToSeconds(input)
		want[i].Test(t, input, got, err)
	}
}

func TestSplitWeekdayString(t *testing.T) {
	inputs := []string{
    "M", "Th", "MWF", "TTh", "MTWThFSSu",
	}
	want := []util.Outcome{
		{Value: []string{"M"}}, {Value: []string{"Th"}}, {Value: []string{"M", "W", "F"}},
    {Value: []string{"T", "Th"}}, {Value: []string{"M", "T", "W", "Th", "F", "S", "Su"}},
	}
	for i, input := range inputs {
		got := util.SplitWeekdayString(input)
		want[i].Test(t, input, got, nil)
	}
}
