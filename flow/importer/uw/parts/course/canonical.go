package course

import "strings"

var subjectRenames = map[string]string{
	"MSCI": "MSE",
}

func canonicalSubject(subj string) string {
	upper := strings.ToUpper(subj)
	if mapped, ok := subjectRenames[upper]; ok {
		return mapped
	}
	return upper
}

func canonicalCourseCode(subj, num string) string {
	return strings.ToLower(canonicalSubject(subj) + num)
}
