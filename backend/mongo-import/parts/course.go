package parts

import (
	"io/ioutil"
	"path"
	"regexp"
	"strings"

	"github.com/jmoiron/sqlx"
	"go.mongodb.org/mongo-driver/bson"
	"gopkg.in/cheggaaa/pb.v1"
)

const CourseCodePattern = `[A-Z]{2,}[0-9]{3,}[A-Z]*`

type MongoCourse struct {
	Id          string  `bson:"_id"`
	Name        string  `bson:"name"`
	Description string  `bson:"description"`
	Prereqs     *string `bson:"prereqs"`
	Coreqs      *string `bson:"coreqs"`
	Antireqs    *string `bson:"antireqs"`
}

func readMongoCourses(rootPath string) []MongoCourse {
	data, err := ioutil.ReadFile(path.Join(rootPath, "course.bson"))
	if err != nil {
		panic(err)
	}

	var courses []MongoCourse
	for len(data) > 0 {
		var r bson.Raw
		var m MongoCourse
		bson.Unmarshal(data, &r)
		bson.Unmarshal(r, &m)
		courses = append(courses, m)
		data = data[len(r):]
	}
	return courses
}

func ImportCourses(db *sqlx.DB, rootPath string, idMap *IdentifierMap) {
	tx := db.MustBegin()
	idMap.Course = make(map[string]int)
	courses := readMongoCourses(rootPath)
	tx.MustExec("TRUNCATE course CASCADE")

	bar := pb.StartNew(len(courses))
	for i, course := range courses {
		bar.Increment()
		idMap.Course[course.Id] = i
		tx.MustExec(
			`INSERT INTO course(id, code, name, description, prereqs, coreqs, antireqs)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			i, course.Id, course.Name, course.Description,
			course.Prereqs, course.Coreqs, course.Antireqs,
		)
	}
	tx.Commit()
	bar.FinishPrint("Courses finished")
}

func ImportCourseRequisites(db *sqlx.DB, rootPath string, idMap *IdentifierMap) {
	tx := db.MustBegin()
	courses := readMongoCourses(rootPath)
	tx.MustExec("TRUNCATE course_prerequisite CASCADE")
	tx.MustExec("TRUNCATE course_antirequisite CASCADE")

	bar := pb.StartNew(len(courses))
	courseCodeRegexp := regexp.MustCompile(CourseCodePattern)
	for _, course := range courses {
		bar.Increment()
		courseId := idMap.Course[course.Id]

		if course.Prereqs != nil {
			prereqCodes := courseCodeRegexp.FindAllString(*course.Prereqs, -1)
			for _, prereqCode := range prereqCodes {
				if prereqId, ok := idMap.Course[strings.ToLower(prereqCode)]; ok {
					tx.MustExec(
						`INSERT INTO course_prerequisite(course_id, prerequisite_id, is_corequisite)
             VALUES ($1, $2, $3)`, courseId, prereqId, false,
					)
				}
			}
		}

		if course.Coreqs != nil {
			coreqCodes := courseCodeRegexp.FindAllString(*course.Coreqs, -1)
			for _, coreqCode := range coreqCodes {
				if coreqId, ok := idMap.Course[strings.ToLower(coreqCode)]; ok {
					tx.MustExec(
						`INSERT INTO course_prerequisite(course_id, prerequisite_id, is_corequisite)
             VALUES ($1, $2, $3)`, courseId, coreqId, true,
					)
				}
			}
		}

		if course.Antireqs != nil {
			antireqCodes := courseCodeRegexp.FindAllString(*course.Antireqs, -1)
			for _, antireqCode := range antireqCodes {
				if antireqId, ok := idMap.Course[strings.ToLower(antireqCode)]; ok {
					tx.MustExec(
						`INSERT INTO course_antirequisite(course_id, antirequisite_id)
             VALUES ($1, $2)`, courseId, antireqId,
					)
				}
			}
		}
	}
	tx.Commit()
	bar.FinishPrint("Course requisites finished")
}
