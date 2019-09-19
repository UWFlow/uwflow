package convert

import "testing"

func TestMongoToPostgresTerm(t *testing.T) {
	id, ok := MongoToPostgresTerm("2017_05")
	if !ok || id != 1175 {
		t.Errorf("Expected (1175, true), got (%d, %t)\n", id, ok)
	}

	id, ok = MongoToPostgresTerm("1175")
	if ok {
		t.Errorf("Expected (*, false), got (%d, %t)\n", id, ok)
	}
}
