package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path"
	"strings"

	"github.com/jackc/pgx"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"gopkg.in/cheggaaa/pb.v1"

	"github.com/AyushK1/uwflow2.0/backend/mongo-import/parts"
)

type ImportFunction func(*pgx.Conn, string, *parts.IdentifierMap) error

func readMongo(rootPath, collection string) []map[string]interface{} {
	data, _ := ioutil.ReadFile(path.Join(rootPath, fmt.Sprintf("%s.bson", collection)))

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

func Profs(conn *pgx.Conn, rootPath string, idMap *parts.IdentifierMap) error {
	tx, err := conn.Begin()
	if err != nil {
		return err
	}
	idMap.Prof = make(map[string]int)
	mProfs := readMongo(rootPath, "professor")
	_, err = tx.Exec("TRUNCATE prof CASCADE")
	if err != nil {
		return err
	}

	bar := pb.StartNew(len(mProfs))
	for i := range mProfs {
		bar.Increment()
		profId := mProfs[i]["_id"].(string)
		profName := strings.TrimSpace(fmt.Sprintf("%s %s", mProfs[i]["first_name"].(string), mProfs[i]["last_name"].(string)))
		idMap.Prof[profId] = i + 1 // Start indexing at 1
		_, err := tx.Exec(
			"INSERT INTO prof(id, name) VALUES ($1, $2)",
			i+1, profName,
		)
		if err != nil {
			return err
		}
	}
	err = tx.Commit()
	if err != nil {
		return err
	}
	bar.FinishPrint("Import profs finished")
	return nil
}

func Users(db *pgx.Conn, rootPath string, idMap *parts.IdentifierMap) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	idMap.User = make(map[primitive.ObjectID]int)
	mUsers := readMongo(rootPath, "user")
	_, err = tx.Exec("TRUNCATE \"user\" CASCADE")
	if err != nil {
		return err
	}

	bar := pb.StartNew(len(mUsers))
	for i := range mUsers {
		bar.Increment()
		userId := mUsers[i]["_id"].(primitive.ObjectID)
		userName := strings.TrimSpace(fmt.Sprintf("%s %s", mUsers[i]["first_name"].(string), mUsers[i]["last_name"].(string)))
		idMap.User[userId] = i
		_, err = tx.Exec(
			"INSERT INTO \"user\"(id, name) VALUES ($1, $2)",
			i, userName,
		)
		if err != nil {
			return err
		}
	}
	err = tx.Commit()
	if err != nil {
		return err
	}
	bar.FinishPrint("Importing users finished")
	return nil
}

func CourseReviews(db *pgx.Conn, rootPath string, idMap *parts.IdentifierMap) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	idMap.CourseReview = make(map[primitive.ObjectID]int)
	mReviews := readMongo(rootPath, "user_course")
	_, err = tx.Exec("TRUNCATE course_review CASCADE")
	if err != nil {
		return err
	}

	bar := pb.StartNew(len(mReviews))
	for i := range mReviews {
		bar.Increment()
		reviewId := mReviews[i]["_id"].(primitive.ObjectID)
		idMap.CourseReview[reviewId] = i
		mr := mReviews[i]["course_review"].(map[string]interface{})

		var CourseID interface{} = nil
		if course_id, ok := mReviews[i]["course_id"].(string); ok {
			CourseID = idMap.Course[course_id]
		}

		var ProfID interface{} = nil
		if prof_id, ok := mReviews[i]["professor_id"].(string); ok {
			ProfID = idMap.Prof[prof_id]
		}

		var Text interface{} = nil
		if text, ok := mr["comment"].(string); ok {
			Text = text
		}

		userId := mReviews[i]["user_id"].(primitive.ObjectID)
		_, err = tx.Exec(
			"INSERT INTO course_review(course_id, prof_id, user_id, text, easy, liked, useful) VALUES ($1, $2, $3, $4, $5, $6, $7)",
			CourseID,
			ProfID,
			idMap.User[userId],
			Text,
			convertRating(mr["easiness"]),
			convertRating(mr["interest"]),
			convertRating(mr["usefulness"]),
		)
		if err != nil {
			return err
		}
	}
	err = tx.Commit()
	if err != nil {
		return err
	}
	bar.FinishPrint("Importing course reviews finished")
	return nil
}

func ProfReviews(db *pgx.Conn, rootPath string, idMap *parts.IdentifierMap) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	idMap.ProfReview = make(map[primitive.ObjectID]int)
	mReviews := readMongo(rootPath, "user_course")
	_, err = tx.Exec("TRUNCATE prof_review CASCADE")
	if err != nil {
		return err
	}

	bar := pb.StartNew(len(mReviews))
	for i := range mReviews {
		bar.Increment()
		reviewId := mReviews[i]["_id"].(primitive.ObjectID)
		idMap.ProfReview[reviewId] = i
		mr := mReviews[i]["professor_review"].(map[string]interface{})

		var CourseID interface{} = nil
		if course_id, ok := mReviews[i]["course_id"].(string); ok {
			CourseID = idMap.Course[course_id]
		}

		var ProfID interface{} = nil
		if prof_id, ok := mReviews[i]["professor_id"].(string); ok {
			ProfID = idMap.Prof[prof_id]
		}

		var Text interface{} = nil
		if text, ok := mr["comment"].(string); ok {
			Text = text
		}

		userId := mReviews[i]["user_id"].(primitive.ObjectID)
		_, err = tx.Exec(
			"INSERT INTO prof_review(course_id, prof_id, user_id, text, clear, engaging) VALUES ($1, $2, $3, $4, $5, $6)",
			CourseID,
			ProfID,
			idMap.User[userId],
			Text,
			convertRating(mr["clarity"]),
			convertRating(mr["passion"]),
		)
		if err != nil {
			return err
		}
	}
	err = tx.Commit()
	if err != nil {
		return err
	}
	bar.FinishPrint("Importing prof reviews finished")
	return nil
}

func Connect() (*pgx.Conn, error) {
	config := pgx.ConnConfig{
		Database: os.Getenv("POSTGRES_DB"),
		Password: os.Getenv("POSTGRES_PASSWORD"),
		User:     os.Getenv("POSTGRES_USER"),
	}
	return pgx.Connect(config)
}

func Run(rootPath string) {
	conn, err := Connect()
	defer conn.Close()
	if err != nil {
		log.Fatal("Failed to open database connection: %v", err)
	}

	idMap := &parts.IdentifierMap{}
	operations := []ImportFunction{
		parts.ImportCourses,
		parts.ImportCourseRequisites,
		Profs,
		parts.ImportSections,
		Users,
		CourseReviews,
		ProfReviews,
	}
	for _, operation := range operations {
		err = operation(conn, rootPath, idMap)
		if err != nil {
			log.Fatal("Import failed: %v", err)
		}
	}
}

func main() {
	args := os.Args
	if len(args) == 2 {
		Run(args[1])
	} else {
		fmt.Println("Usage: main.go MONGO_DUMP_PATH")
	}
}
