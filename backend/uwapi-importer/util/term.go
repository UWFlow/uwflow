// Term-related utility functions
package util

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

// Quest id of the current term according to system time.
func CurrentTermId() int {
	return DateToTermId(time.Now())
}

// Quest id of the previous term according to system time.
func PreviousTermId() int {
	// Conveniently, the previous term is the term that was current 4 months ago
	return DateToTermId(time.Now().AddDate(0, -4, 0))
}

// Quest id of the next term according to system time.
func NextTermId() int {
	// Conveniently, the next term is the term that will be current in 4 months
	return DateToTermId(time.Now().AddDate(0, 4, 0))
}

// Quest id of the term that was current at the point in time given by date.
func DateToTermId(date time.Time) int {
	var seasonId int
	if date.Month() >= time.September {
		seasonId = 9
	} else if date.Month() >= time.May {
		seasonId = 5
	} else {
		seasonId = 1
	}
	return (date.Year()-1900)*10 + seasonId
}

// Quest id of a term given by its English name, e.g. "Fall 2019".
func TermNameToId(name string) (int, error) {
	components := strings.Split(name, " ")
	if len(components) != 2 {
		return 0, fmt.Errorf("not a term name: %s", name)
	}
	var month int
	switch components[0] {
	case "Fall":
		month = 9
	case "Spring":
		month = 5
	case "Winter":
		month = 1
	default:
		return 0, fmt.Errorf("not a season: %s", components[0])
	}
	year, err := strconv.Atoi(components[1])
	if err != nil {
		return 0, fmt.Errorf("not a year: %s", components[1])
	}
	return (year-1900)*10 + month, nil
}
