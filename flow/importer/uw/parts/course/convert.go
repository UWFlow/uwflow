package course

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"

	"flow/common/util"
	"flow/importer/uw/log"
	"flow/importer/uw/parts/term"

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

// Parses course requirements description to separate prereqs, coreqs, antireqs
func parseCourseRequirements(requirements *string) (string, string, string, error) {
	if requirements == nil || *requirements == "" {
		return "", "", "", nil
	}

	var prereqs string
	var coreqs string
	var antireqs string
	reqs := *requirements

	// Find all occurrences of ":" to find where to split the string
	// For each colon, find start index immediately preceding word to determine
	// type such as prereq, coreq, antireq. There are some special cases where
	// multiple show up, such as "prereq/coreq:" where we default to prereq
	startIdx := make([]int, 0)
	endIdx := make([]int, 0)
	for i, c := range reqs {
		if c == ':' {
			curIdx := i
			precedingWord := ""
			for {
				if curIdx < 0 || reqs[curIdx] == ' ' {
					if curIdx < 0 {
						curIdx = 0
					}
					break
				}
				precedingWord = string(reqs[curIdx]) + precedingWord
				curIdx -= 1
			}

			precedingWord = strings.ToLower(precedingWord)
			if strings.Contains(precedingWord, "prereq") ||
				strings.Contains(precedingWord, "coreq") ||
				strings.Contains(precedingWord, "antireq") {
				startIdx = append(startIdx, curIdx)
				endIdx = append(endIdx, i)
			}
		}
	}

	// Parse out required substrings without the prefix and trim whitespace
	for i := 0; i < len(startIdx); i++ {
		var nextStartIdx int
		if i == len(startIdx)-1 {
			nextStartIdx = len(reqs)
		} else {
			nextStartIdx = startIdx[i+1]
		}

		reqTypeString := strings.ToLower(reqs[startIdx[i] : endIdx[i]+1])
		reqString := strings.TrimSpace(reqs[endIdx[i]+1 : nextStartIdx])
		if strings.Contains(reqTypeString, "prereq") {
			prereqs = reqString
		} else if strings.Contains(reqTypeString, "coreq") {
			coreqs = reqString
		} else {
			antireqs = reqString
		}
	}

	return prereqs, coreqs, antireqs, nil
}

func convertAll(
	dst *convertResult,
	apiCourses []apiCourse,
	apiClasses []apiClass,
	idToTerm map[int]*term.Term,
) error {
	for _, apiCourse := range apiCourses {
		convertCourse(dst, &apiCourse)
	}

	if dst.Profs == nil {
		dst.Profs = make(profMap)
	}

	for _, apiClass := range apiClasses {
		if apiClass.TermId == nil {
			continue
		}

		termId, err := strconv.Atoi(*apiClass.TermId)
		if err != nil {
			continue
		}

		term := idToTerm[termId]
		err = convertSection(dst, &apiClass, term)
		if err != nil {
			log.Warnf("failed to convert section: %v", err)
		}
	}

	return nil
}

func convertCourse(dst *convertResult, apiCourse *apiCourse) error {
	courseCode := strings.ToLower(apiCourse.Subject + apiCourse.Number)
	newCourse := course{
		Code: courseCode,
		Name: apiCourse.Name,
	}

	if apiCourse.Description != nil && *apiCourse.Description != "" {
		newCourse.Description = pgtype.Varchar{
			String: *apiCourse.Description,
			Status: pgtype.Present,
		}
	} else {
		newCourse.Description.Status = pgtype.Null
	}

	// Parse requirements and add to results
	prereqs, coreqs, antireqs, err := parseCourseRequirements(apiCourse.Requirements)
	if err != nil {
		log.Warnf("failed to parse requirements for course: %s", courseCode)
	}

	if prereqs != "" {
		prereqString, prereqCodes := expandCourseCodes(prereqs)

		newCourse.Prereqs = pgtype.Varchar{
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
		newCourse.Prereqs.Status = pgtype.Null
	}

	if coreqs != "" {
		coreqString, coreqCodes := expandCourseCodes(coreqs)

		newCourse.Coreqs = pgtype.Varchar{
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
		newCourse.Coreqs.Status = pgtype.Null
	}

	if antireqs != "" {
		antireqString, antireqCodes := expandCourseCodes(antireqs)

		newCourse.Antireqs = pgtype.Varchar{
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
		newCourse.Antireqs.Status = pgtype.Null
	}

	dst.Courses = append(dst.Courses, newCourse)
	return nil
}

func convertSection(dst *convertResult, apiClass *apiClass, term *term.Term) error {
	// Skip any dummy classes with unreasonable enrollment capacity
	if apiClass.EnrollmentCapacity >= 9999 {
		return nil
	}

	// Skip classes that fail to provide a course component
	if apiClass.CourseComponent == nil {
		return fmt.Errorf("section missing course component for course: %s", apiClass.CourseCode)
	}

	tz, err := time.LoadLocation("Canada/Eastern")
	if err != nil {
		return fmt.Errorf("failed to load location Canada/Eastern")
	}

	sectionNumber := strconv.Itoa(apiClass.SectionNumber)
	sectionNumber = strings.Repeat("0", 3-len(sectionNumber)) + sectionNumber
	sectionName := *apiClass.CourseComponent + " " + sectionNumber
	dst.Sections = append(
		dst.Sections,
		section{
			CourseCode:         apiClass.CourseCode,
			ClassNumber:        apiClass.ClassNumber,
			SectionName:        sectionName,
			Campus:             "",
			EnrollmentCapacity: apiClass.EnrollmentCapacity,
			EnrollmentTotal:    apiClass.EnrolledStudents,
			TermId:             term.Id,
			UpdatedAt:          time.Now().In(tz),
		},
	)

	for _, apiClassSchedule := range apiClass.Meetings {
		err := convertMeeting(dst, apiClass, &apiClassSchedule, term)
		if err != nil {
			log.Warnf("failed to convert meeting: %v", err)
		}
	}

	return nil
}

func convertMeeting(
	dst *convertResult,
	apiClass *apiClass,
	apiClassSchedule *apiClassSchedule,
	term *term.Term,
) error {
	// Skip any meetings with class number 0 since they contain bad data
	if apiClassSchedule.MeetingNumber == 0 {
		return nil
	}

	dst.Meetings = append(
		dst.Meetings,
		meeting{
			ClassNumber: apiClass.ClassNumber,
			TermId:      term.Id,
			IsCancelled: false,
			IsClosed:    false,
			IsTba:       false,
		},
	)
	meeting := &dst.Meetings[len(dst.Meetings)-1]

	/* TODO: Add back once the V3 API returns prof names
	if len(apiClass.Instructors) > 0 {
		// FIXME: it is not actually correct to discard instructors after 0th!
		// There exists at least one grad seminar with more than one instructor.
		// However, this does not happen with undergrad courses,
		// and having an array column of foreign keys is not possible.
		// This may well be a reasonable compromise in the end.
		name, err := util.LastFirstToFirstLast(apiClass.Instructors[0])
		if err != nil {
			return fmt.Errorf("failed to convert name: %w", err)
		}
		code := util.ProfNameToCode(name)
		dst.Profs[code] = name
		meeting.ProfCode = pgtype.Varchar{String: code, Status: pgtype.Present}
	} else {
		meeting.ProfCode.Status = pgtype.Null
	}
	*/
	meeting.ProfCode.Status = pgtype.Null

	if apiClassSchedule.Location != nil {
		location := *apiClassSchedule.Location
		meeting.Location = pgtype.Varchar{String: location, Status: pgtype.Present}
	} else {
		meeting.Location.Status = pgtype.Null
	}

	var err error
	startSeconds, err := util.TimeStringToSeconds(apiClassSchedule.StartTime)
	if err != nil {
		return fmt.Errorf("failed to convert time: %w", err)
	}
	meeting.StartSeconds = pgtype.Int4{Int: int32(startSeconds), Status: pgtype.Present}

	endSeconds, err := util.TimeStringToSeconds(apiClassSchedule.EndTime)
	if err != nil {
		return fmt.Errorf("failed to convert time: %w", err)
	}
	meeting.EndSeconds = pgtype.Int4{Int: int32(endSeconds), Status: pgtype.Present}

	meeting.StartDate, err = time.Parse(util.ApiV3DateLayout, apiClassSchedule.StartDate)
	if err != nil {
		return fmt.Errorf("failed to convert date: %w", err)
	}

	meeting.EndDate, err = time.Parse(util.ApiV3DateLayout, apiClassSchedule.EndDate)
	if err != nil {
		return fmt.Errorf("failed to convert date: %w", err)
	}

	if apiClassSchedule.Weekdays != nil {
		meeting.Days = util.ParseWeekdayString(*apiClassSchedule.Weekdays)
	} else {
		meeting.Days = make([]string, 0)
	}

	return nil
}
