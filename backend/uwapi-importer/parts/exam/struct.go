package exam

import "time"

type Exam struct {
	CourseCode     string
	SectionName    string
	Term           int
	Location       *string
	StartSeconds   *int
	EndSeconds     *int
	Day            *string
	Date           *time.Time
	IsTba          bool
}

type ApiExam struct {
	// *not* a code: upper case and contains space, e.g. "CS 145"
	CourseSubjectNumber string           `json:"course"`
	Sections            []ApiExamSection `json:"sections"`
}

type ApiExamSection struct {
	SectionName    string `json:"section"`
	Date           string `json:"date"`
	StartTime      string `json:"start_time"`
	EndTime        string `json:"end_time"`
	Location       string `json:"location"`
}
