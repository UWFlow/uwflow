package course

type Course struct {
	Code        string
	Name        string
	Description string
	Prereqs     string
	Coreqs      string
	Antireqs    string
}

// We only care about the course id: everything else is present in CourseDetail
type ApiCourseListItem struct {
	CourseId string `json:"course_id"`
}

type ApiCourseListResponse struct {
	Data []ApiCourseListItem `json:"data"`
}

type ApiCourseDetail struct {
	Subject        string `json:"subject"`
	CatalogNumber  string `json:"catalog_number"`
	Title          string `json:"title"`
	Description    string `json:"description"`
	Prerequisites  string `json:"prerequisites"`
	Corequisites   string `json:"corequisites"`
	Antirequisites string `json:"antirequisites"`
}

type ApiCourseDetailResponse struct {
	Data ApiCourseDetail `json:"data"`
}
