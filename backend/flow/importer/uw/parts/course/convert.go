package course

import (
	"regexp"
	"strings"
)

var CourseCodeRegexp = regexp.MustCompile(`([A-Z]{2,}\s+)?[0-9]{3,}[A-Z]*`)

func nextSpace(input string, startIndex int) (int, bool) {
	var char byte
	for i := startIndex; i < len(input); i++ {
		char = input[i]
		if char == ' ' || char == '\t' || char == '\n' {
			return i, true
		}
	}
	return startIndex, false
}

func FindCourseCodes(input string) ([][]int, []string) {
	matches := CourseCodeRegexp.FindAllStringIndex(input, -1)
	codes := make([]string, len(matches))
	var lastCode string
	for i, bounds := range matches {
		s, e := bounds[0], bounds[1]
		if '0' <= input[s] && input[s] <= '9' {
			codes[i] = strings.ToLower(lastCode + input[s:e])
		} else {
			spaceIndex, _ := nextSpace(input, s)
			lastCode = input[s:spaceIndex]
			codes[i] = strings.ToLower(lastCode + input[spaceIndex+1:e])
		}
	}
	return matches, codes
}

// ExpandCourseCodes takes a string containing course numbers
// not necessarily prefixed with a course subject
// and outputs a best attempt at a string where all such numbers
// are replaced with full uppercase course codes. For example,
//  "One of STAT 230/240/206"
// becomes
//  "One of STAT230/STAT240/STAT206"
// For {pre,co,anti}requisite strings, this guess is always accurate.
//
// Additionally, ExpandCourseCodes returns the list of all
// course codes occuring in the string.
func ExpandCourseCodes(input string) (string, []string) {
	var sb strings.Builder
	// Output is at least as long as the input
	sb.Grow(len(input))

	matches, codes := FindCourseCodes(input)
	lastEnd := 0

	for i, match := range matches {
		sb.WriteString(input[lastEnd:match[0]])
		sb.WriteString(strings.ToUpper(codes[i]))
		lastEnd = match[1]
	}
	sb.WriteString(input[lastEnd:])

	return sb.String(), codes
}

func ConvertAll(dst *ConvertResult, apiCourses []ApiCourse) error {
	dst.Courses = make([]Course, len(apiCourses))

	for i, apiCourse := range apiCourses {
		courseCode := strings.ToLower(apiCourse.Subject + apiCourse.Number)
		prereqString, prereqCodes := ExpandCourseCodes(apiCourse.Prereqs)
		coreqString, coreqCodes := ExpandCourseCodes(apiCourse.Coreqs)
		antireqString, antireqCodes := ExpandCourseCodes(apiCourse.Antireqs)

		dst.Courses[i] = Course{
			Code:        courseCode,
			Name:        apiCourse.Name,
			Description: apiCourse.Description,
			Prereqs:     prereqString,
			Coreqs:      coreqString,
			Antireqs:    antireqString,
		}

		for _, prereqCode := range prereqCodes {
			dst.Prereqs = append(
				dst.Prereqs,
				Prereq{
					CourseCode: courseCode,
					PrereqCode: prereqCode,
					IsCoreq:    false,
				},
			)
		}
		for _, coreqCode := range coreqCodes {
			dst.Prereqs = append(
				dst.Prereqs,
				Prereq{
					CourseCode: courseCode,
					PrereqCode: coreqCode,
					IsCoreq:    true,
				},
			)
		}
		for _, antireqCode := range antireqCodes {
			dst.Antireqs = append(
				dst.Antireqs,
				Antireq{
					CourseCode:  courseCode,
					AntireqCode: antireqCode,
				},
			)
		}
	}
	return nil
}
