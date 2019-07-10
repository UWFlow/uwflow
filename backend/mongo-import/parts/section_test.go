package parts

import "testing"

func TestConvertTermId(t *testing.T) {
	id, ok := ConvertTermId("2017_05")
	if !ok || id != 1175 {
		t.Errorf("Expected (1175, true), got (%d, %t)\n", id, ok)
	}

	id, ok = ConvertTermId("1175")
	if ok {
		t.Errorf("Expected (*, false), got (%d, %t)\n", id, ok)
	}
}
