package util

import (
	"fmt"
	"strconv"
	"time"
)

func CurrentPostgresTerm() int {
	return DateToPostgresTerm(time.Now())
}

func DateToPostgresTerm(date time.Time) int {
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

func HumanToPostgresTerm(season string, year string) (int, error) {
	var seasonId int
	switch season {
	case "Fall":
		seasonId = 9
	case "Spring":
		seasonId = 5
	case "Winter":
		seasonId = 1
	default:
		return 0, fmt.Errorf("%s is not a season", season)
	}
	yearNumber, err := strconv.Atoi(year)
	if err != nil {
		return 0, fmt.Errorf("%s is not a year: %v", year, err)
	}
	return (yearNumber-1900)*10 + seasonId, nil
}
