package util_test

import (
  "testing"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/util"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/test"
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
  for i, input := range(inputs) {
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
  for i, input := range(inputs) {
    got := util.ProfNameToCode(input)
    want[i].Test(t, input, got, nil)
  }
}
