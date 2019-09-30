package section

import "time"

type Section struct {
	Id                 int
	CourseCode         string
	ClassNumber        int
	SectionName        string
	Campus             string
	EnrollmentCapacity int
	EnrollmentTotal    int
	TermId             int
}

type Meeting struct {
	ClassNumber  int
	TermId       int
	ProfCode     *string
	Location     *string
	StartSeconds *int
	EndSeconds   *int
	StartDate    time.Time
	EndDate      time.Time
	Days         []string
	IsCancelled  bool
	IsClosed     bool
	IsTba        bool
}

// Why is this here? Because there is no standalone endpoint for profs in v2.
// We therefore have to extract profs from sections during conversion.
type Prof struct {
	Code string
	Name string
}

type ApiSectionResponse struct {
	Data []ApiSection `json:"data"`
}

type ApiSection struct {
	Subject            string       `json:"subject"`
	CatalogNumber      string       `json:"catalog_number"`
	ClassNumber        int          `json:"class_number"`
	SectionName        string       `json:"section"`
	Campus             string       `json:"campus"`
	EnrollmentCapacity int          `json:"enrollment_capacity"`
	EnrollmentTotal    int          `json:"enrollment_total"`
	TermId             int          `json:"term"`
	Meetings           []ApiMeeting `json:"classes"`
}

type ApiMeeting struct {
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
