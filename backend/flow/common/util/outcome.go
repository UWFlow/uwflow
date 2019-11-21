package util

import "reflect"

type Outcome struct {
	Value interface{}
	Error bool
}

type fatalfer interface {
	Fatalf(format string, args ...interface{})
}

func (m Outcome) Test(f fatalfer, input interface{}, value interface{}, err error) {
	if m.Error {
		if err == nil {
			f.Fatalf("For: %+v; got: %+v; want err", input, value)
		}
	} else {
		if err != nil {
			f.Fatalf("For: %+v; err: %v; want: %+v", input, err, m.Value)
		} else if !reflect.DeepEqual(value, m.Value) {
			f.Fatalf("For: %+v; got: %+v; want: %+v", input, value, m.Value)
		}
	}
}
