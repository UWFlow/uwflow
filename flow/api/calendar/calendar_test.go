package calendar

import (
	"bytes"
	"strings"
	"testing"
	"time"
)

func TestWriteCalendar(t *testing.T) {
	startTime := time.Date(2023, 10, 25, 14, 30, 0, 0, time.UTC)
	events := []*webcalEvent{
		{
			GroupId: 123,
			Summary: "CS 135 - LEC 001",
			StartTime: startTime,
			EndTime: startTime.Add(1 * time.Hour),
			Location: "MC 4045",
		},
	}

	var output bytes.Buffer
	writeCalendar(&output, "test_secret_id", events)
	result := output.String()

	expectedTimestamp := "20231025T143000Z"
	if !strings.Contains(result, "DTSTART:"+expectedTimestamp) {
		t.Errorf("Expected output to contain start time %q, but got:\n%s", expectedTimestamp, result)
	}
}
