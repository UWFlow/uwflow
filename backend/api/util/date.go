package util

import (
	"fmt"
	"strconv"
)

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
	return 1000 + (yearNumber%100)*10 + seasonId, nil
}
