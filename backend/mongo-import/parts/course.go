package parts

import (
	"io/ioutil"
	"path"
	"regexp"
	"strings"

	"github.com/jackc/pgx"
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

func ImportCourses(db *pgx.Conn, rootPath string, idMap *IdentifierMap) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	idMap.Course = make(map[string]int)
	courses := readMongoCourses(rootPath)
	preparedCourses := make([][]interface{}, len(courses))

	bar := pb.StartNew(len(courses))
	for i, course := range courses {
		bar.Increment()
		idMap.Course[course.Id] = i + 1
		preparedCourses[i] = []interface{}{
			course.Id,
			course.Name,
			course.Description,
			course.Prereqs,
			course.Coreqs,
			course.Antireqs,
		}
	}
	_, err = tx.CopyFrom(
		pgx.Identifier{"course"},
		[]string{"code", "name", "description", "prereqs", "coreqs", "antireqs"},
		pgx.CopyFromRows(preparedCourses),
	)
	if err != nil {
		return err
	}
	err = tx.Commit()
	if err != nil {
		return err
	}
	bar.FinishPrint("Courses finished")
	return nil
}

func ImportCourseRequisites(db *pgx.Conn, rootPath string, idMap *IdentifierMap) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	courses := readMongoCourses(rootPath)
	// Reserve len(courses) slots to avoid reallocs. In reality, we will need fewer.
	preparedPrereqs := make([][]interface{}, 0, len(courses))
	preparedAntireqs := make([][]interface{}, 0, len(courses))

	bar := pb.StartNew(len(courses))
	courseCodeRegexp := regexp.MustCompile(CourseCodePattern)
	for _, course := range courses {
		bar.Increment()
		courseId := idMap.Course[course.Id]

		if course.Prereqs != nil {
			prereqCodes := courseCodeRegexp.FindAllString(*course.Prereqs, -1)
			for _, prereqCode := range prereqCodes {
				if prereqId, ok := idMap.Course[strings.ToLower(prereqCode)]; ok {
					preparedPrereqs = append(
						preparedPrereqs,
						[]interface{}{courseId, prereqId, false},
					)
				}
			}
		}

		if course.Coreqs != nil {
			coreqCodes := courseCodeRegexp.FindAllString(*course.Coreqs, -1)
			for _, coreqCode := range coreqCodes {
				if coreqId, ok := idMap.Course[strings.ToLower(coreqCode)]; ok {
					preparedPrereqs = append(
						preparedPrereqs,
						[]interface{}{courseId, coreqId, true},
					)
				}
			}
		}

		if course.Antireqs != nil {
			antireqCodes := courseCodeRegexp.FindAllString(*course.Antireqs, -1)
			for _, antireqCode := range antireqCodes {
				if antireqId, ok := idMap.Course[strings.ToLower(antireqCode)]; ok {
					preparedAntireqs = append(
						preparedAntireqs,
						[]interface{}{courseId, antireqId},
					)
				}
			}
		}
	}

	_, err = tx.CopyFrom(
		pgx.Identifier{"course_prerequisite"},
		[]string{"course_id", "prerequisite_id", "is_corequisite"},
		pgx.CopyFromRows(preparedPrereqs),
	)
	if err != nil {
		return err
	}
	_, err = tx.CopyFrom(
		pgx.Identifier{"course_antirequisite"},
		[]string{"course_id", "antirequisite_id"},
		pgx.CopyFromRows(preparedAntireqs),
	)
	if err != nil {
		return err
	}
	err = tx.Commit()
	if err != nil {
		return err
	}
	bar.FinishPrint("Course requisites finished")
	return nil
}
