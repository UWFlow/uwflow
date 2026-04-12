package course

import (
	"fmt"
	"strings"

	"flow/importer/uw/api"
	"flow/importer/uw/log"
)

func fetchAll(client *api.Client, termIds []int) ([]apiCourse, []apiClass, error) {
	// Fetch course data
	courses, err := fetchCourses(client, termIds)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to fetch courses: %w", err)
	}

	// Fetch class schedules for all returned courses, for upcoming terms
	var classes []apiClass
	var numClasses = len(courses) * len(termIds)
	var numFetched = 0

	for _, course := range courses {
		for _, termId := range termIds {
			numFetched += 1
			if numFetched%500 == 0 {
				log.Warnf("fetched %d/%d courses", numFetched, numClasses)
			}

			fetchedClasses, err := fetchClass(client, &course, termId)
			if err != nil {
				return nil, nil, fmt.Errorf("failed to fetch class schedules for %s %s in term %d: %w", course.Subject, course.Number, termId, err)
			}

			for _, class := range fetchedClasses {
				class.CourseCode = strings.ToLower(course.Subject + course.Number)
				classes = append(classes, class)
			}
		}
	}

	return courses, classes, nil
}

func fetchClass(client *api.Client, course *apiCourse, termId int) ([]apiClass, error) {
	var classes []apiClass
	endpoint := fmt.Sprintf("ClassSchedules/%d/%s/%s", termId, course.Subject, course.Number)
	err := client.Getv3(endpoint, &classes)

	// Many courses returned for each term may not have class schedules and return a 404
	if api.IsNotFound(err) {
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
			if err != nil {
				log.Warnf("skipping course with missing data")
				continue
			}

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
