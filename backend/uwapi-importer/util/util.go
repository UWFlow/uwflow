package util

import (
	"fmt"
	"log"
	"strconv"
	"strings"
)

func LogApiBug(message string, args ...interface{}) {
	formatted := fmt.Sprintf(message, args)
	log.Println("API bug:", formatted)
}

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
