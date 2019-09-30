package util

import (
	"fmt"
	"strconv"
	"strings"
)

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
		return -1, fmt.Errorf("minutes component is not an integer: %s", splits[0])
	}
	return hours*3600 + minutes*60, nil
}
