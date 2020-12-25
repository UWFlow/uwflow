package course

import (
	"regexp"
	"strings"

	"github.com/jackc/pgtype"
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

// expandCourseCodes takes a string containing course numbers
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
func expandCourseCodes(input string) (string, []string) {
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

func convertAll(dst *convertResult, apiCourses []apiCourse) error {
	dst.Courses = make([]course, len(apiCourses))

	for i, apiCourse := range apiCourses {
		courseCode := strings.ToLower(apiCourse.Subject + apiCourse.Number)

		dst.Courses[i] = course{
			Code: courseCode,
			Name: apiCourse.Name,
		}
		course := &dst.Courses[i]

		if apiCourse.Description != "" {
			course.Description = pgtype.Varchar{
				String: apiCourse.Description,
				Status: pgtype.Present,
			}
		} else {
			course.Description.Status = pgtype.Null
		}

		if apiCourse.Prereqs != "" {
			prereqString, prereqCodes := expandCourseCodes(apiCourse.Prereqs)

			course.Prereqs = pgtype.Varchar{
				String: prereqString,
				Status: pgtype.Present,
			}

			for _, prereqCode := range prereqCodes {
				dst.Prereqs = append(
					dst.Prereqs,
					prereq{
						CourseCode: courseCode,
						PrereqCode: prereqCode,
						IsCoreq:    false,
					},
				)
			}
		} else {
			course.Prereqs.Status = pgtype.Null
		}

		if apiCourse.Coreqs != "" {
			coreqString, coreqCodes := expandCourseCodes(apiCourse.Coreqs)

			course.Coreqs = pgtype.Varchar{
				String: coreqString,
				Status: pgtype.Present,
			}

			for _, coreqCode := range coreqCodes {
				dst.Prereqs = append(
					dst.Prereqs,
					prereq{
						CourseCode: courseCode,
						PrereqCode: coreqCode,
						IsCoreq:    true,
					},
				)
			}
		} else {
			course.Coreqs.Status = pgtype.Null
		}

		if apiCourse.Antireqs != "" {
			antireqString, antireqCodes := expandCourseCodes(apiCourse.Antireqs)

			course.Antireqs = pgtype.Varchar{
				String: antireqString,
				Status: pgtype.Present,
			}

			for _, antireqCode := range antireqCodes {
				dst.Antireqs = append(
					dst.Antireqs,
					antireq{
						CourseCode:  courseCode,
						AntireqCode: antireqCode,
					},
				)
			}
		} else {
			course.Antireqs.Status = pgtype.Null
		}
	}

	return nil
}
