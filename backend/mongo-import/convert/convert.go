package convert

import "strconv"

func MongoToPostgresTerm(termId string) (id int, ok bool) {
	for i := range termId {
		if termId[i] == '_' {
			year, _ := strconv.Atoi(termId[:i])
			month, _ := strconv.Atoi(termId[i+1:])
			return 1000 + (year%100)*10 + month, true
		}
	}
	return 0, false
}
