package convert

import (
	"fmt"
	"strconv"
)

func MongoToPostgresTerm(termId string) (int, error) {
	for i := range termId {
		if termId[i] == '_' {
			year, err := strconv.Atoi(termId[:i])
			if err != nil {
				return 0, fmt.Errorf("%q is not a number", termId[:i])
			}
			month, err := strconv.Atoi(termId[i+1:])
			if err != nil {
				return 0, fmt.Errorf("%q is not a number", termId[:i+1])
			}
			return 1000 + (year%100)*10 + month, nil
		}
	}
	return 0, fmt.Errorf("no underscore in %q", termId)
}
