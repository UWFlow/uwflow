package course

import (
	"fmt"
	"strings"
	"time"

	"flow/importer/uw/api"
	"flow/importer/uw/log"
)

// classRequestDelay is the minimum pause between consecutive ClassSchedules
// requests. The UW Open Data API enforces a limit of 120 req/min (0.5s/req).
// 550ms gives ~109 req/min, leaving headroom for course-list calls that also
// count against the same quota.
const classRequestDelay = 550 * time.Millisecond

func fetchAll(client *api.Client, termIds []int) ([]apiCourse, []apiClass, error) {
	// Fetch course data
	courses, err := fetchCourses(client, termIds)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to fetch courses: %w", err)
	}

	// Fetch class schedules for all returned courses, for upcoming terms.
	// Requests are kept sequential (one at a time) with a small inter-request
	// delay to avoid triggering API rate limits.
	var classes []apiClass
	numClasses := len(courses) * len(termIds)
	numFetched := 0

	for _, course := range courses {
		for _, termId := range termIds {
			fetched, err := fetchClass(client, &course, termId)
			numFetched++
			if numFetched%500 == 0 {
				log.Warnf("fetched %d/%d class schedules", numFetched, numClasses)
			}

			if err != nil {
				log.Warnf("failed to fetch section with error %s, proceeding anyway", err)
			} else {
				for _, class := range fetched {
					class.CourseCode = strings.ToLower(course.Subject + course.Number)
					classes = append(classes, class)
				}
			}

			time.Sleep(classRequestDelay)
		}
	}

	return courses, classes, nil
}

func fetchClass(client *api.Client, course *apiCourse, termId int) ([]apiClass, error) {
	var classes []apiClass
	endpoint := fmt.Sprintf("ClassSchedules/%d/%s/%s", termId, course.Subject, course.Number)
	err := client.Getv3(endpoint, &classes)

	// Many courses returned for each term may not have class schedules and return a 404.
	if err != nil && strings.Contains(err.Error(), "404") {
		return classes, nil
	}

	return classes, err
}

func fetchCourses(client *api.Client, termIds []int) ([]apiCourse, error) {
	var courses []apiCourse
	seenCourse := make(map[string]bool)

	// Fetch courses termwise with deduplication
	for _, termId := range termIds {
		termCourses, err := fetchCoursesByTerm(client, termId)
		if err != nil {
			return nil, fmt.Errorf("failed to fetch term %d: %w", termId, err)
		}
		for _, course := range termCourses {
			courseCode := course.Subject + course.Number
			if !seenCourse[courseCode] {
				courses = append(courses, course)
				seenCourse[courseCode] = true
			}
		}
	}

	return courses, nil
}

func fetchCoursesByTerm(client *api.Client, termId int) ([]apiCourse, error) {
	var courses []apiCourse
	endpoint := fmt.Sprintf("Courses/%d", termId)
	err := client.Getv3(endpoint, &courses)
	return courses, err
}
