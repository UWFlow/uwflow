package util_test

import (
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/test"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/util"
	"testing"
	"time"
)

func TestDateToTermId(t *testing.T) {
	inputs := []time.Time{
		time.Date(2019, 10, 8, 0, 0, 0, 0, time.UTC),
		time.Date(2011, 8, 31, 0, 0, 0, 0, time.UTC),
		time.Date(2011, 9, 1, 0, 0, 0, 0, time.UTC),
	}
	want := []test.Outcome{
		{Value: 1199}, {Value: 1115}, {Value: 1119},
	}
	for i, input := range inputs {
		got := util.DateToTermId(input)
		want[i].Test(t, input, got, nil)
	}
}

func TestTermNameToId(t *testing.T) {
	inputs := []string{
		"Fall 2019", "Spring 2020", "Winter 2001",
		"Summer 2020", "1195", "Winter", "2015 Spring",
	}
	want := []test.Outcome{
		{Value: 1199}, {Value: 1205}, {Value: 1011},
		{Error: true}, {Error: true}, {Error: true}, {Error: true},
	}
	for i, input := range inputs {
		got, err := util.TermNameToId(input)
		want[i].Test(t, input, got, err)
	}
}
