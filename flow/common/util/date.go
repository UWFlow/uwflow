package util

import (
	"fmt"
	"time"
)

// This is *almost* ISO8601, but ever so slightly off (no timezone)
// Unfortunately, this forces us to reify the parsing process.
const ApiV3DateLayout = "2006-01-02T15:04:05"

// Weekday codes corresponding to order of days returned by the UW API
var WeekdayCodes = []string{"M", "T", "W", "Th", "F", "S", "Su"}

// Map API V3 date string to seconds since midnight: hh * 3600 + mm * 60
func TimeStringToSeconds(date string) (int, error) {
	parsedDate, err := time.Parse(ApiV3DateLayout, date)
	if err != nil {
		return -1, fmt.Errorf("failed to parse date: %w", err)
	}
	return parsedDate.Hour()*3600 + parsedDate.Minute()*60, nil
}

// Parse a weekday string like "NYNYNNN" into
// separate strings for each day like ["T", "Th"]
func ParseWeekdayString(weekdays string) []string {
	// Crucially, splitWeekdays should never be nil, so allocate zero-length slice
	splitWeekdays := make([]string, 0)
	i := 0
	for i < len(weekdays) {
		if weekdays[i] == 'Y' {
			splitWeekdays = append(splitWeekdays, WeekdayCodes[i])
		}
		i += 1
	}
	return splitWeekdays
}
