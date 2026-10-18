package embedding

import "testing"

func TestContentHashSeparatesFields(t *testing.T) {
	a := contentHash(course{code: "cs1", name: "35"})
	b := contentHash(course{code: "cs13", name: "5"})
	if a == b {
		t.Error("contentHash collided across field boundaries")
	}
}
