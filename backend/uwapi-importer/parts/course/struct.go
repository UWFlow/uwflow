package course

// Data necessary to uniquely identify a course, equivalent to a course code
type CourseHandle struct {
	Subject string `json:"subject"`
	Number  string `json:"catalog_number"`
}

type Course struct {
	Subject     string `json:"subject"`
	Number      string `json:"catalog_number"`
	Name        string `json:"title"`
	Description string `json:"description"`
	Prereqs     string `json:"prerequisites"`
	Coreqs      string `json:"corequisites"`
	Antireqs    string `json:"antirequisites"`
}
