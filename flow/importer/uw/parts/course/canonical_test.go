package course

import "testing"

func TestCanonicalCourseCode(t *testing.T) {
	tests := []struct {
		subj string
		num  string
		want string
	}{
		{"MSCI", "100", "mse100"},
		{"msci", "331", "mse331"},
		{"MSE", "100", "mse100"},
		{"CS", "115", "cs115"},
	}

	for _, tt := range tests {
		got := canonicalCourseCode(tt.subj, tt.num)
		if got != tt.want {
			t.Fatalf("canonicalCourseCode(%s,%s) = %s, want %s", tt.subj, tt.num, got, tt.want)
		}
	}
}
