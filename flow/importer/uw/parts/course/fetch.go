package course

import (
	"fmt"
	"strings"

	"flow/importer/uw/api"
	"flow/importer/uw/log"
)

type empty struct{}
type semaphore chan []apiClass

const rateLimit = 20

func fetchAll(client *api.Client, termIds []int) ([]apiCourse, []apiClass, error) {
	// Fetch course data
	courses, err := fetchCourses(client, termIds)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to fetch courses: %w", err)
	}

	// Fetch class schedules for all returned courses, for upcoming terms
	var classes []apiClass
	var numClasses = len(courses) * len(termIds)
	sema := make(semaphore, rateLimit)
	errch := make(chan error, numClasses)

	for i := range courses {
		for j := range termIds {
			go asyncFetchClass(client, &courses[i], termIds[j], sema, errch)
			classes = append(classes, <-sema...)
			err = <-errch
			if err != nil {
				log.Warnf("failed to fetch section with error %w, proceeding anyway", err)
				continue
			}
		}
	}

	return courses, classes, nil
}

func asyncFetchClass(
	client *api.Client,
	course *apiCourse,
	termId int,
	sema semaphore,
	errch chan error,
) {
	classes, err := fetchClass(client, course, termId)
	sema <- classes
	errch <- err
}

func fetchClass(client *api.Client, course *apiCourse, termId int) ([]apiClass, error) {
	var classes []apiClass
	endpoint := fmt.Sprintf("ClassSchedule/%d/%s/%s", termId, *course.Subject, *course.Number)
	err := client.Getv3(endpoint, &classes)

	// Some courses returned for each term may not have class schedules and return a 404
	if strings.Contains(err.Error(), "404") {
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
			if !seenCourse[*course.Subject+*course.Number] {
				courses = append(courses, course)
				seenCourse[*course.Subject+*course.Number] = true
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
