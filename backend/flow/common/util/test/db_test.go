package test

import (
	"testing"

	"flow/common/util"
)

type fieldTestStruct struct {
  Id int
  FullName string
  MaybeScore *int
}

func TestFields(t *testing.T) {
  var input fieldTestStruct
  want := util.Outcome{Value: []string{"id", "full_name", "maybe_score"}}

  got := util.Fields(input)
  want.Test(t, input, got, nil)
}

func TestAsSlice(t *testing.T) {
  score := 42
  input := fieldTestStruct{
    Id: 123,
    FullName: "test name",
    MaybeScore: &score,
  }
  want := util.Outcome{Value: []interface{}{123, "test name", &score}}

  got := util.AsSlice(input)
  want.Test(t, input, got, nil)
}
