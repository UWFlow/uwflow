package parts

import (
	"io/ioutil"
	"path"
	"regexp"
	"strings"

	"flow/common/db"
	"flow/common/state"
	"flow/importer/mongo/log"

	"go.mongodb.org/mongo-driver/bson"
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

func ImportCourses(state *state.State, idMap *IdentifierMap) error {
	log.StartImport(state.Log, "course")

	tx, err := state.Db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	idMap.Course = make(map[string]int)
	courses := readMongoCourses(state.Env.MongoDumpPath)
	preparedCourses := make([][]interface{}, len(courses))

	for i, course := range courses {
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
	count, err := tx.CopyFrom(
		db.Identifier{"course"},
		[]string{"code", "name", "description", "prereqs", "coreqs", "antireqs"},
		preparedCourses,
	)
	if err != nil {
		return err
	}
	log.EndImport(state.Log, "course", count)

	return tx.Commit()
}

func ImportCourseRequisites(state *state.State, idMap *IdentifierMap) error {
	log.StartImport(state.Log, "course_prerequisite")
	log.StartImport(state.Log, "course_antirequisite")

	tx, err := state.Db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	courses := readMongoCourses(state.Env.MongoDumpPath)
	// Reserve len(courses) slots to avoid reallocs. In reality, we will need fewer.
	preparedPrereqs := make([][]interface{}, 0, len(courses))
	preparedAntireqs := make([][]interface{}, 0, len(courses))
	seenPrereqs := make(map[IntPair]bool)
	seenAntireqs := make(map[IntPair]bool)

	courseCodeRegexp := regexp.MustCompile(CourseCodePattern)
	for _, course := range courses {
		courseId := idMap.Course[course.Id]

		if course.Prereqs != nil {
			prereqCodes := courseCodeRegexp.FindAllString(*course.Prereqs, -1)
			for _, prereqCode := range prereqCodes {
				if prereqId, ok := idMap.Course[strings.ToLower(prereqCode)]; ok {
					if seenPrereqs[IntPair{prereqId, courseId}] {
						continue
					}
					preparedPrereqs = append(
						preparedPrereqs,
						[]interface{}{courseId, prereqId, false},
					)
					seenPrereqs[IntPair{prereqId, courseId}] = true
				}
			}
		}

		if course.Coreqs != nil {
			coreqCodes := courseCodeRegexp.FindAllString(*course.Coreqs, -1)
			for _, coreqCode := range coreqCodes {
				if coreqId, ok := idMap.Course[strings.ToLower(coreqCode)]; ok {
					if seenPrereqs[IntPair{coreqId, courseId}] {
						continue
					}
					preparedPrereqs = append(
						preparedPrereqs,
						[]interface{}{courseId, coreqId, true},
					)
					seenPrereqs[IntPair{coreqId, courseId}] = true
				}
			}
		}

		if course.Antireqs != nil {
			antireqCodes := courseCodeRegexp.FindAllString(*course.Antireqs, -1)
			for _, antireqCode := range antireqCodes {
				if antireqId, ok := idMap.Course[strings.ToLower(antireqCode)]; ok {
					if seenAntireqs[IntPair{antireqId, courseId}] {
						continue
					}
					preparedAntireqs = append(
						preparedAntireqs,
						[]interface{}{courseId, antireqId},
					)
					seenAntireqs[IntPair{antireqId, courseId}] = true
				}
			}
		}
	}

	prereqCount, err := tx.CopyFrom(
		db.Identifier{"course_prerequisite"},
		[]string{"course_id", "prerequisite_id", "is_corequisite"},
		preparedPrereqs,
	)
	if err != nil {
		return err
	}
	log.EndImport(state.Log, "course_prerequisite", prereqCount)

	antireqCount, err := tx.CopyFrom(
		db.Identifier{"course_antirequisite"},
		[]string{"course_id", "antirequisite_id"},
		preparedAntireqs,
	)
	if err != nil {
		return err
	}
	log.EndImport(state.Log, "course_antirequisite", antireqCount)

	return tx.Commit()
}
