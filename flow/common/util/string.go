package util

import (
	"strings"
)

func IsLowerCase(char byte) bool {
	return 'a' <= char && char <= 'z'
}

func ToLowerCase(char byte) byte {
	return char - 'A' + 'a'
}

func IsUpperCase(char byte) bool {
	return 'A' <= char && char <= 'Z'
}

func ToUpperCase(char byte) byte {
	return char - 'a' + 'A'
}

// Convert CamelCase to snake_case
func CamelToSnakeCase(in string) string {
	var sb strings.Builder

	for i := 0; i < len(in); i++ {
		if IsUpperCase(in[i]) {
			if i > 0 && IsLowerCase(in[i-1]) {
				sb.WriteByte('_')
			}
			sb.WriteByte(ToLowerCase(in[i]))
		} else {
			sb.WriteByte(in[i])
		}
	}

	return sb.String()
}

// Map prof name to prof code: "First Middle Last" => "first_middle_last"
// Normalizes names to only contain latin letters. Other symbols are dropped.
func ProfNameToCode(profName string) string {
	var sb strings.Builder
	var lastIsLetter bool

	for i := 0; i < len(profName); i++ {
		// Uppercase Latin letters are extracted and converted to lowercase
		if IsUpperCase(profName[i]) {
			sb.WriteByte(ToLowerCase(profName[i]))
			lastIsLetter = true
			// Lowercase Latin letters are extracted as-is
		} else if IsLowerCase(profName[i]) {
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

func parseNumber(input string) (result int, consumed int) {
	number := 0
	i := 0
	for ; i < len(input) && '0' <= input[i] && input[i] <= '9'; i++ {
		number = number*10 + int(input[i]-'0')
	}
	return number, i
}

// ExpandNumberRange takes a string describing a range of numbers
// and converts it to a slice containing each number in the range.
// For example, "LEC 001,003-005,007" becomes [1, 3, 4, 5, 7].
func ExpandNumberRange(input string) []int {
	var numbers []int
	N := len(input)
	for i := 0; i < N; i++ {
		currentNumber, consumed := parseNumber(input[i:])
		i += consumed
		if consumed > 0 {
			numbers = append(numbers, currentNumber)
			if i < N-1 && input[i] == '-' {
				nextNumber, consumed := parseNumber(input[i+1:])
				i += consumed + 1
				if consumed == 0 {
					continue
				}
				for number := currentNumber + 1; number <= nextNumber; number++ {
					numbers = append(numbers, number)
				}
			}
		}
	}
	return numbers
}
