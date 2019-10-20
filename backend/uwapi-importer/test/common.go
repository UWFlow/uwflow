package test

import (
	"reflect"
	"testing"
	"time"
)

func IntPointerTo(v int) *int {
	return &v
}

func StringPointerTo(v string) *string {
	return &v
}

func TimePointerTo(v time.Time) *time.Time {
	return &v
}

type Outcome struct {
	Value interface{}
	Error bool
}

func (m Outcome) Test(t *testing.T, input interface{}, value interface{}, err error) {
	if m.Error {
		if err == nil {
			t.Fatalf("For: %+v; got: %+v; want err", input, value)
		}
	} else {
		if err != nil {
			t.Fatalf("For: %+v; err: %v; want: %+v", input, err, m.Value)
		} else if !reflect.DeepEqual(value, m.Value) {
			t.Fatalf("For: %+v; got: %+v; want: %+v", input, value, m.Value)
		}
	}
}
