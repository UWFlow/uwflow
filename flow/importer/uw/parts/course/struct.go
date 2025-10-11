package course

import (
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

type convertResult struct {
	Courses  []course
	Prereqs  []prereq
	Antireqs []antireq
	Sections []section
	Meetings []meeting
	Profs    profMap
}

type section struct {
	CourseCode         string
	ClassNumber        int
	SectionName        string
	EnrollmentCapacity int
	EnrollmentTotal    int
	TermId             int
	UpdatedAt          time.Time
	IsOnline           bool
}

type meeting struct {
	ClassNumber  int
	TermId       int
	ProfCode     pgtype.Text
	Location     pgtype.Text
	StartSeconds pgtype.Int4
	EndSeconds   pgtype.Int4
	StartDate    time.Time
	EndDate      time.Time
	Days         []string
	IsCancelled  bool
	IsClosed     bool
	IsTba        bool
}

type profMap map[string]string // code -> name

type course struct {
	Code        string
	Name        string
	Description pgtype.Text
	Prereqs     pgtype.Text
	Coreqs      pgtype.Text
	Antireqs    pgtype.Text
}

type prereq struct {
	CourseCode string
	PrereqCode string
	IsCoreq    bool
}

type antireq struct {
	CourseCode  string
	AntireqCode string
}

type apiCourse struct {
	Subject      string  `json:"subjectCode"`
	Number       string  `json:"catalogNumber"`
	Name         string  `json:"title"`
	Description  *string `json:"description"`
	Requirements *string `json:"requirementsDescription"`
}

type apiClass struct {
	CourseCode         string               // Must be populated manually
	ClassNumber        int                  `json:"classNumber"`
	CourseComponent    *string              `json:"courseComponent"`
	SectionNumber      int                  `json:"classSection"`
	EnrollmentCapacity int                  `json:"maxEnrollmentCapacity"`
	EnrolledStudents   int                  `json:"enrolledStudents"`
	TermId             *string              `json:"termCode"`
	Meetings           []apiClassSchedule   `json:"scheduleData"`
	Instructors        []apiClassInstructor `json:"instructorData"`
}

type apiClassSchedule struct {
	StartDate     string  `json:"scheduleStartDate"`
	EndDate       string  `json:"scheduleEndDate"`
	StartTime     string  `json:"classMeetingStartTime"`
	EndTime       string  `json:"classMeetingEndTime"`
	Location      *string `json:"locationName"`
	Weekdays      *string `json:"classMeetingWeekPatternCode"`
	MeetingNumber int     `json:"classMeetingNumber"`
}

type apiClassInstructor struct {
	FirstName string `json:"instructorFirstName"`
	LastName  string `json:"instructorLastName"`
}
