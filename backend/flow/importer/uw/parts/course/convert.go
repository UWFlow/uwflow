package course

import (
	"regexp"
	"strings"
)

var (
	SubjectRegexp = regexp.MustCompile(`\b[A-Z]{2,}\b`)
	NumberRegexp  = regexp.MustCompile(`\b[0-9]{3}[A-Z]*\b`)
)

type match struct {
	start int
	end   int
	kind  int
}

const (
	numberMatch int = iota
	subjectMatch
)

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
	var output strings.Builder
	// Output is at least as long as the input
	output.Grow(len(input))

	subjects := SubjectRegexp.FindAllStringIndex(input, -1)
	numbers := NumberRegexp.FindAllStringIndex(input, -1)

	var matches []match
	var sidx, nidx = 0, 0
	var slen, nlen = len(subjects), len(numbers)

	for sidx < slen && nidx < nlen {
		for ; sidx < slen && subjects[sidx][1] < numbers[nidx][0]; sidx++ {
			matches = append(
				matches,
				match{
					kind:  subjectMatch,
					start: subjects[sidx][0],
					end:   subjects[sidx][1],
				},
			)
		}
		for ; nidx < nlen && (sidx >= slen || numbers[nidx][1] < subjects[sidx][0]); nidx++ {
			matches = append(
				matches,
				match{
					kind:  numberMatch,
					start: numbers[nidx][0],
					end:   numbers[nidx][1],
				},
			)
		}
	}

	var codes []string

	var prevKind = numberMatch
	var lastSubject []string
	var lastEnd int
	for _, match := range matches {
		if match.kind == subjectMatch {
			if prevKind == numberMatch {
				output.WriteString(input[lastEnd:match.start])
				lastSubject = nil
			}
			lastSubject = append(lastSubject, input[match.start:match.end])
		} else { // match.kind == numberMatch
			if prevKind == numberMatch {
				output.WriteString(input[lastEnd:match.start])
			}
			lastEnd = match.end

			var number = input[match.start:match.end]
			for i, subject := range lastSubject {
				output.WriteString(subject)
				output.WriteString(number)
				if i < len(lastSubject)-1 {
					output.WriteByte('/')
				}
				codes = append(codes, strings.ToLower(subject+number))
			}
		}
		prevKind = match.kind
	}
	output.WriteString(input[lastEnd:])

	return output.String(), codes
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
