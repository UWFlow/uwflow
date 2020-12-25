package course

import (
	"github.com/jackc/pgtype"
)

type convertResult struct {
	Courses  []course
	Prereqs  []prereq
	Antireqs []antireq
}

type course struct {
	Code        string
	Name        string
	Description pgtype.Varchar
	Prereqs     pgtype.Varchar
	Coreqs      pgtype.Varchar
	Antireqs    pgtype.Varchar
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
	Subject     string `json:"subject"`
	Number      string `json:"catalog_number"`
	Name        string `json:"title"`
	Description string `json:"description"`
	Prereqs     string `json:"prerequisites"`
	Coreqs      string `json:"corequisites"`
	Antireqs    string `json:"antirequisites"`
}
