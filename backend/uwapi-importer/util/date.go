package util

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

var WeekdayCodes = []string{"M", "T", "W", "Th", "F", "S", "Su"}

// Convert date to UW-style weekday abbreviation
func DateToWeekdayCode(date time.Time) string {
	return WeekdayCodes[date.Weekday()]
}

// Convert a "month/day" string to full date,
// given that it occurs during the term starting at termStart
func MonthDayToDate(monthDay string, termStart time.Time) (time.Time, error) {
	fullDate := fmt.Sprintf("%s/%d", monthDay, termStart.Year())
	return time.Parse("01/02/2006", fullDate)
}

// Map 24h time string to seconds since midnight: "hh:mm" => hh * 3600 + mm * 60
func TimeString24HToSeconds(time string) (int, error) {
	splits := strings.Split(time, ":")
	if len(splits) != 2 {
		return -1, fmt.Errorf("expected: hours:minutes; got: %s", time)
	}
	hours, err := strconv.Atoi(splits[0])
	if err != nil {
		return -1, fmt.Errorf("hours component is not an integer: %s", splits[0])
	}
	minutes, err := strconv.Atoi(splits[1])
	if err != nil {
		return -1, fmt.Errorf("minutes component is not an integer: %s", splits[1])
	}
	return hours*3600 + minutes*60, nil
}

// Map 12h time format to seconds since midnight:
// "hh:mm [AM|PM]" => hh * 3600 + mm * 60 + [0 | 12 * 3600]
func TimeString12HToSeconds(time string) (int, error) {
	splits := strings.Split(time, " ")
	if len(splits) != 2 {
		return -1, fmt.Errorf("expected: time [AM|PM]; got: %s", time)
	}
	// Offload time parsing to the 24h version, then fix up
	seconds, err := TimeString24HToSeconds(splits[0])
	if err != nil {
		return -1, err
	}
	// 12th hour is actually 0th hour wrt the half-day it starts:
	// 12:00am = 00:00, 01:00am = 01:00, ..., 12:00pm = 12:00, 01:00pm = 13;00, ...
	if 12*3600 <= seconds && seconds < 13*3600 {
		seconds -= 12 * 3600
	}
	switch splits[1] {
	case "AM":
		break
	case "PM":
		seconds += 12 * 3600
	default:
		return -1, fmt.Errorf("not an AM/PM suffix: %s", splits[1])
	}
	return seconds, nil
}
