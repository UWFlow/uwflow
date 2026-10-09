package embedding

import "testing"

func TestFormatCode(t *testing.T) {
	tests := []struct{ in, want string }{
		{"cs135", "CS 135"},
		{"msci100a", "MSCI 100A"},
		{"pd1", "PD 1"},
		{"noDigits", "NODIGITS"},
	}
	for _, tt := range tests {
		t.Run(tt.in, func(t *testing.T) {
			if got := formatCode(tt.in); got != tt.want {
				t.Errorf("formatCode(%q) = %q, want %q", tt.in, got, tt.want)
			}
		})
	}
}

func TestDocument(t *testing.T) {
	tests := []struct {
		name string
		in   course
		want string
	}{
		{
			"with description",
			course{code: "cs135", name: "Designing Functional Programs", description: "An introduction."},
			"CS 135: Designing Functional Programs. An introduction.",
		},
		{
			"without description",
			course{code: "pd1", name: "Career Fundamentals"},
			"PD 1: Career Fundamentals",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := document(tt.in); got != tt.want {
				t.Errorf("document() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestContentHashSeparatesFields(t *testing.T) {
	a := contentHash(course{code: "cs1", name: "35"})
	b := contentHash(course{code: "cs13", name: "5"})
	if a == b {
		t.Error("contentHash collided across field boundaries")
	}
}
