package course

type ConvertResult struct {
	Courses  []Course
	Prereqs  []Prereq
	Antireqs []Antireq
}

type Course struct {
	Code        string
	Name        string
	Description string
	Prereqs     string
	Coreqs      string
	Antireqs    string
}

type Prereq struct {
	CourseCode string
	PrereqCode string
	IsCoreq    bool
}

type Antireq struct {
	CourseCode  string
	AntireqCode string
}

// Data necessary to uniquely identify a course, equivalent to a course code
type ApiCourseHandle struct {
	Subject string `json:"subject"`
	Number  string `json:"catalog_number"`
}

type ApiCourse struct {
	Subject     string `json:"subject"`
	Number      string `json:"catalog_number"`
	Name        string `json:"title"`
	Description string `json:"description"`
	Prereqs     string `json:"prerequisites"`
	Coreqs      string `json:"corequisites"`
	Antireqs    string `json:"antirequisites"`
}
