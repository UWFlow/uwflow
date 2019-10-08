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
// Normalizes names to only contain latin letters. Other symbols are dropped.
func ProfNameToCode(profName string) string {
  var sb strings.Builder
  var lastIsLetter bool

	for i := 0; i < len(profName); i++ {
    // Uppercase Latin letters are extracted and converted to lowercase
    if 'A' <= profName[i] && profName[i] <= 'Z' {
      sb.WriteByte(profName[i] - 'A' + 'a')
      lastIsLetter = true
    // Lowercase Latin letters are extracted as-is
    } else if 'a' <= profName[i] && profName[i] <= 'z' {
      sb.WriteByte(profName[i])
      lastIsLetter = true
    // Everything else is dropped
    } else if lastIsLetter {
      sb.WriteByte('_')
      lastIsLetter = false
    }
	}
  // If last symbol was not a letter,
  // then we have appended an extra _ at the end.
  // Return constructed string without that underscore.
  if sb.Len() > 0 && !lastIsLetter {
    return sb.String()[:sb.Len()-1]
  } else {
    return sb.String()
  }
}
