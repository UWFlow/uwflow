package parse

import (
	"fmt"
	"testing"

	"flow/api/parse/schedule"
	"flow/api/serde"
)

func TestScheduleErrorEnum(t *testing.T) {
	tests := []struct {
		name string
		err  error
		want string
	}{
		{"no term", schedule.ErrNoTerm, serde.NoTermSchedule},
		{"course selection", schedule.ErrCourseSelection, serde.CourseSelectionSchedule},
		{"not registered", schedule.ErrNotRegistered, serde.NotRegisteredSchedule},
		{"wrapped", fmt.Errorf("parsing: %w", schedule.ErrNoTerm), serde.NoTermSchedule},
		{"unrecognized", fmt.Errorf("\"Fall 1800\" is not a term"), ""},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := scheduleErrorEnum(tt.err); got != tt.want {
				t.Fatalf("got %q, want %q", got, tt.want)
			}
		})
	}
}
