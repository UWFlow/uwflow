package util_test

import (
	"flow/worker/importer/uw/test"
	"flow/worker/importer/uw/util"
	"testing"
)

func TestLastFirstToFirstLast(t *testing.T) {
	inputs := []string{
		"Jao,David", "Marcoux,Laurent W.",
		"Mansour", "Andrew Kennings", "",
	}
	want := []test.Outcome{
		{Value: "David Jao"}, {Value: "Laurent W. Marcoux"},
		{Error: true}, {Error: true}, {Error: true},
	}
	for i, input := range inputs {
		got, err := util.LastFirstToFirstLast(input)
		want[i].Test(t, input, got, err)
	}
}

func TestProfNameToCode(t *testing.T) {
	inputs := []string{
		"David Jao", "Laurent W. Marcoux", "  David   McKinnon ",
		// The following string contains literal tabs
		"Laurent	W	Marcoux", "Jean-Claude O'Donnel",
		"Mansour", "3412 Andrew Kennings", "",
	}
	want := []test.Outcome{
		{Value: "david_jao"}, {Value: "laurent_w_marcoux"}, {Value: "david_mckinnon"},
		{Value: "laurent_w_marcoux"}, {Value: "jean_claude_o_donnel"},
		{Value: "mansour"}, {Value: "andrew_kennings"}, {Value: ""},
	}
	for i, input := range inputs {
		got := util.ProfNameToCode(input)
		want[i].Test(t, input, got, nil)
	}
}

func TestExpandNumberRange(t *testing.T) {
	inputs := []string{
		"001", "001,003,005",
		"1-3", "000,001-005,007",
		"001,003-garbage", "LEC 001, 002, 015",
	}
	want := []test.Outcome{
		{Value: []int{1}}, {Value: []int{1, 3, 5}},
		{Value: []int{1, 2, 3}}, {Value: []int{0, 1, 2, 3, 4, 5, 7}},
		{Value: []int{1, 3}}, {Value: []int{1, 2, 15}},
	}
	for i, input := range inputs {
		got := util.ExpandNumberRange(input)
		want[i].Test(t, input, got, nil)
	}
}
