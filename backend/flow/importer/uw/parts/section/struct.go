package section

import (
	"time"

	"github.com/jackc/pgtype"
)

type convertResult struct {
	Sections []section
	Meetings []meeting
	Profs    profMap
}

type section struct {
	CourseCode         string
	ClassNumber        int
	SectionName        string
	Campus             string
	EnrollmentCapacity int
	EnrollmentTotal    int
	TermId             int
	UpdatedAt          time.Time
}

type meeting struct {
	ClassNumber  int
	TermId       int
	ProfCode     pgtype.Varchar
	Location     pgtype.Varchar
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

type apiSection struct {
	Subject            string       `json:"subject"`
	CatalogNumber      string       `json:"catalog_number"`
	ClassNumber        int          `json:"class_number"`
	SectionName        string       `json:"section"`
	Campus             string       `json:"campus"`
	EnrollmentCapacity int          `json:"enrollment_capacity"`
	EnrollmentTotal    int          `json:"enrollment_total"`
	TermId             int          `json:"term"`
	LastUpdated        time.Time    `json:"last_updated"`
	Meetings           []apiMeeting `json:"classes"`
}

type apiMeeting struct {
	Date struct {
		Weekdays    string  `json:"weekdays"`
		IsCancelled bool    `json:"is_cancelled"`
		IsClosed    bool    `json:"is_closed"`
		IsTba       bool    `json:"is_tba"`
		StartDate   *string `json:"start_date"`
		EndDate     *string `json:"end_date"`
		StartTime   *string `json:"start_time"`
		EndTime     *string `json:"end_time"`
	} `json:"date"`
	Location struct {
		Building *string `json:"building"`
		Room     *string `json:"room"`
	} `json:"location"`
	Instructors []string `json:"instructors"`
}
