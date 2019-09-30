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

// Map time string to seconds since midnight: "hh:mm" => hh * 3600 + mm * 60
func TimeStringToSeconds(time string) (int, error) {
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

func TimeString12HToSeconds(time string) (int, error) {
  splits := strings.Split(time, " ")
	if len(splits) != 2 {
		return -1, fmt.Errorf("expected: time [AM|PM]; got: %s", time)
	}
  // Convert the time component
  seconds, err := TimeStringToSeconds(splits[0])
  if err != nil {
    return -1, err
  }
  if 12 * 3600 <= seconds && seconds < 13 * 3600 {
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
