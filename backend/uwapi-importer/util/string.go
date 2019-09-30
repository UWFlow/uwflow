package util

import (
	"fmt"
	"strconv"
	"strings"
)

// Map prof name to prof code: "Last,First Middle" => "first_middle_last"
func ProfNameToCode(profName string) (string, error) {
	splits := strings.Split(profName, ",")
	if len(splits) != 2 {
		return "", fmt.Errorf("expected: Last,First( Middle)?; got: %s", profName)
	}
	firstMiddle := strings.ToLower(strings.TrimSpace(splits[1]))
	firstMiddleCode := strings.Join(strings.Split(firstMiddle, " "), "_")
	last := strings.ToLower(strings.TrimSpace(splits[0]))
	return fmt.Sprintf("%s_%s", firstMiddleCode, last), nil
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
		return -1, fmt.Errorf("minutes component is not an integer: %s", splits[0])
	}
	return hours*3600 + minutes*60, nil
}
