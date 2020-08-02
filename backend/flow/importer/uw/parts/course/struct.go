package course

import (
	"github.com/jackc/pgtype"
)

type ConvertResult struct {
	Courses  []Course
	Prereqs  []Prereq
	Antireqs []Antireq
}

type Course struct {
	Code        string
	Name        string
	Description pgtype.Varchar
	Prereqs     pgtype.Varchar
	Coreqs      pgtype.Varchar
	Antireqs    pgtype.Varchar
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

type ApiCourse struct {
	Subject     string `json:"subject"`
	Number      string `json:"catalog_number"`
	Name        string `json:"title"`
	Description string `json:"description"`
	Prereqs     string `json:"prerequisites"`
	Coreqs      string `json:"corequisites"`
	Antireqs    string `json:"antirequisites"`
}
