package test

import "testing"

type Outcome struct {
  Value interface{}
  Error bool
}

func (m Outcome) Test(t *testing.T, input interface{}, value interface{}, err error) {
  if m.Error {
    if err == nil {
      t.Fatalf("For: %v; got: %v; want err", input, value)
    }
  } else {
    if err != nil {
      t.Fatalf("For: %v; err: %v; want: %v", input, err, m.Value)
    } else if value != m.Value {
      t.Fatalf("For: %v; got: %v; want: %v", input, value, m.Value)
    }
  }
}
