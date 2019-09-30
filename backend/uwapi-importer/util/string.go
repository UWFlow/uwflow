package util

import (
	"fmt"
	"strings"
)

// Map name in "Last,First..." format to "First...Last" format
func LastFirstToFirstLast(name string) (string, error) {
	splits := strings.Split(name, ",")
	if len(splits) != 2 {
		return "", fmt.Errorf("expected: Last,First; got: %s", name)
	}
	return fmt.Sprintf("%s %s", splits[1], splits[0]), nil
}

// Map prof name to prof code: "First Middle Last" => "first_middle_last"
func ProfNameToCode(profName string) string {
	splits := strings.Split(profName, " ")
	for i := range splits {
		splits[i] = strings.ToLower(strings.TrimSpace(splits[i]))
	}
	return strings.Join(splits, "_")
}
