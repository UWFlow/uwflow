package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path"
	"strings"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"gopkg.in/cheggaaa/pb.v1"

	"github.com/AyushK1/uwflow2.0/backend/mongo-import/parts"
)

func readMongo(rootPath, collection string) []map[string]interface{} {
	data, err := ioutil.ReadFile(path.Join(rootPath, fmt.Sprintf("%s.bson", collection)))
	if err != nil {
		log.Fatal(err)
	}

	var mcourses []map[string]interface{}
	// We must iteratively fetch each MongoDB Document until all bytes are ingested
	for len(data) > 0 {
		// Raw is a wrapper around byte slice that is interpreted as BSON document
		// Data must be wrapped by Raw before being decoded and stored in map
		var r bson.Raw
		var m map[string]interface{}
		bson.Unmarshal(data, &r)
		bson.Unmarshal(r, &m)
		mcourses = append(mcourses, m)
		data = data[len(r):]
	}
	return mcourses
}

func convertRating(value interface{}) interface{} {
	if value == nil {
		return nil
	}
	// Translate from binary to multi-bin (0 1 2 3 4 5)
	// Make translation "soft": map to medium intensity ratings and not extremes
	switch value.(float64) {
	case 0.0:
		return 1
	case 1.0:
		return 4
	default:
		return -1 // unreachable
	}
}

func Profs(db *sqlx.DB, rootPath string, idMap map[string]bson.M) {
	tx := db.MustBegin()
	idMap["prof"] = bson.M{}
	mProfs := readMongo(rootPath, "professor")
	tx.MustExec("TRUNCATE prof CASCADE")

	bar := pb.StartNew(len(mProfs))
	for i := range mProfs {
		bar.Increment()
		idMap["prof"][mProfs[i]["_id"].(string)] = i + 1 // Start indexing at 1
		tx.MustExec(
			"INSERT INTO prof(id, name) VALUES ($1, $2)",
			i + 1, strings.TrimSpace(fmt.Sprintf("%s %s", mProfs[i]["first_name"].(string), mProfs[i]["last_name"].(string))),
		)
	}
	tx.Commit()
	bar.FinishPrint("Import profs finished")
}

func Users(db *sqlx.DB, rootPath string, idMap map[string]bson.M) {
	tx := db.MustBegin()
	idMap["user"] = bson.M{}
	mUsers := readMongo(rootPath, "user")
	tx.MustExec("TRUNCATE \"user\" CASCADE")

	bar := pb.StartNew(len(mUsers))
	for i := range mUsers {
		bar.Increment()
		userId := mUsers[i]["_id"].(primitive.ObjectID).String()
		idMap["user"][userId] = i
		tx.MustExec(
			"INSERT INTO \"user\"(id, name) VALUES ($1, $2)",
			i, strings.TrimSpace(fmt.Sprintf("%s %s", mUsers[i]["first_name"].(string), mUsers[i]["last_name"].(string))),
		)
	}
	tx.Commit()
	bar.FinishPrint("Importing users finished")
}

func CourseReviews(db *sqlx.DB, rootPath string, idMap map[string]bson.M) {
	tx := db.MustBegin()
	idMap["course_review"] = bson.M{}
	mReviews := readMongo(rootPath, "user_course")
	tx.MustExec("TRUNCATE course_review CASCADE")

	bar := pb.StartNew(len(mReviews))
	for i := range mReviews {
		bar.Increment()
		reviewId := mReviews[i]["_id"].(primitive.ObjectID).String()
		idMap["course_review"][reviewId] = i
		mr := mReviews[i]["course_review"].(map[string]interface{})

		var CourseID interface{} = nil
		if course_id, ok := mReviews[i]["course_id"].(string); ok {
			CourseID = idMap["course"][course_id]
		}

		var ProfID interface{} = nil
		if prof_id, ok := mReviews[i]["professor_id"].(string); ok {
			ProfID = idMap["prof"][prof_id]
		}

		var Text interface{} = nil
		if text, ok := mr["comment"].(string); ok {
			Text = text
		}

		userId := mReviews[i]["user_id"].(primitive.ObjectID).String()
		tx.MustExec(
			"INSERT INTO course_review(course_id, prof_id, user_id, text, easy, liked, useful) VALUES ($1, $2, $3, $4, $5, $6, $7)",
			CourseID,
			ProfID,
			idMap["user"][userId],
			Text,
			convertRating(mr["easiness"]),
			convertRating(mr["interest"]),
			convertRating(mr["usefulness"]),
		)
	}
	tx.Commit()
	bar.FinishPrint("Importing course reviews finished")
}

func ProfReviews(db *sqlx.DB, rootPath string, idMap map[string]bson.M) {
	tx := db.MustBegin()
	idMap["prof_review"] = bson.M{}
	mReviews := readMongo(rootPath, "user_course")
	tx.MustExec("TRUNCATE prof_review CASCADE")

	bar := pb.StartNew(len(mReviews))
	for i := range mReviews {
		bar.Increment()
		reviewId := mReviews[i]["_id"].(primitive.ObjectID).String()
		idMap["prof_review"][reviewId] = i
		mr := mReviews[i]["professor_review"].(map[string]interface{})

		var CourseID interface{} = nil
		if course_id, ok := mReviews[i]["course_id"].(string); ok {
			CourseID = idMap["course"][course_id]
		}

		var ProfID interface{} = nil
		if prof_id, ok := mReviews[i]["professor_id"].(string); ok {
			ProfID = idMap["prof"][prof_id]
		}

		var Text interface{} = nil
		if text, ok := mr["comment"].(string); ok {
			Text = text
		}

		userId := mReviews[i]["user_id"].(primitive.ObjectID).String()
		tx.MustExec(
			"INSERT INTO prof_review(course_id, prof_id, user_id, text, clear, engaging) VALUES ($1, $2, $3, $4, $5, $6)",
			CourseID,
			ProfID,
			idMap["user"][userId],
			Text,
			convertRating(mr["clarity"]),
			convertRating(mr["passion"]),
		)
	}
	tx.Commit()
	bar.FinishPrint("Importing prof reviews finished")
}

func Connect() *sqlx.DB {
	name := os.Getenv("POSTGRES_DB")
	pass := os.Getenv("POSTGRES_PASSWORD")
	port := os.Getenv("POSTGRES_PORT")
	user := os.Getenv("POSTGRES_USER")
	url := fmt.Sprintf("postgres://%s:%s@localhost:%s/%s?sslmode=disable", user, pass, port, name)
	return sqlx.MustConnect("postgres", url)
}

func Run(rootPath string) {
	db := Connect()
	idMap := map[string]bson.M{}

	parts.ImportCourses(db, rootPath, idMap)
	parts.ImportCourseRequisites(db, rootPath, idMap)
	Profs(db, rootPath, idMap)
	parts.ImportSections(db, rootPath, idMap)
	Users(db, rootPath, idMap)
	CourseReviews(db, rootPath, idMap)
	ProfReviews(db, rootPath, idMap)
}

func main() {
	args := os.Args
	if len(args) == 2 {
		Run(args[1])
	} else {
		fmt.Println("Usage: main.go MONGO_DUMP_PATH")
	}
}
