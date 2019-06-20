package main

import (
    "fmt"
    "path"
    "log"
    "io/ioutil"
    "os"
    "strings"

    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "github.com/jmoiron/sqlx"
    _ "github.com/lib/pq"
    "gopkg.in/cheggaaa/pb.v1"
)

func readMongo(rootPath, collection string) []map[string]interface{} {
    data, err := ioutil.ReadFile(path.Join(rootPath, fmt.Sprintf("%s.bson", collection)))
    if err != nil {
        log.Fatal(err)
    }

    var mcourses []map[string]interface{}
    for len(data) > 0 {
        var r bson.Raw
        var m map[string]interface{}
        bson.Unmarshal(data, &r)
        bson.Unmarshal(r, &m)
        mcourses = append(mcourses, m)
        data = data[len(r):]
    }
    return mcourses
}

func trinary(value interface{}) interface{} {
    if value == nil {
        return nil
    } else {
        return int(value.(float64)) != 0
    }
}

func Courses(db *sqlx.DB, rootPath string, idMap map[string]bson.M) {
    tx := db.MustBegin()
    idMap["course"] = bson.M{}
    mCourses := readMongo(rootPath, "course")
    tx.MustExec("TRUNCATE course CASCADE")

    bar := pb.StartNew(len(mCourses))
    for i := range mCourses {
        bar.Increment()
        idMap["course"][mCourses[i]["_id"].(string)] = i
        tx.MustExec(
            "INSERT INTO course(id, code, name, description) VALUES ($1, $2, $3, $4)",
            i,
            mCourses[i]["_id"].(string),
            mCourses[i]["name"].(string),
            mCourses[i]["description"].(string),
        )
    }
    tx.Commit()
    bar.FinishPrint("Import courses finished")
}

func Profs(db *sqlx.DB, rootPath string, idMap map[string]bson.M) {
    tx := db.MustBegin()
    idMap["prof"] = bson.M{}
    mProfs := readMongo(rootPath, "professor")
    tx.MustExec("TRUNCATE prof CASCADE")

    bar := pb.StartNew(len(mProfs))
    for i := range mProfs {
        bar.Increment()
        idMap["prof"][mProfs[i]["_id"].(string)] = i
        tx.MustExec(
            "INSERT INTO prof(id, name) VALUES ($1, $2)",
            i, strings.TrimSpace(fmt.Sprintf("%s %s", mProfs[i]["first_name"].(string), mProfs[i]["last_name"].(string))),
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
        idMap["user"][mUsers[i]["_id"].(primitive.ObjectID).String()] = i
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
        idMap["course_review"][mReviews[i]["_id"].(primitive.ObjectID).String()] = i
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

        tx.MustExec(
            "INSERT INTO course_review(course_id, prof_id, user_id, text, easy, liked, useful) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            CourseID,
            ProfID,
            idMap["user"][mReviews[i]["user_id"].(primitive.ObjectID).String()],
            Text,
            trinary(mr["easiness"]),
            trinary(mr["interest"]),
            trinary(mr["usefulness"]),
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
        idMap["prof_review"][mReviews[i]["_id"].(primitive.ObjectID).String()] = i
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

        tx.MustExec(
            "INSERT INTO prof_review(course_id, prof_id, user_id, text, clear, engaging) VALUES ($1, $2, $3, $4, $5, $6)",
            CourseID,
            ProfID,
            idMap["user"][mReviews[i]["user_id"].(primitive.ObjectID).String()],
            Text,
            trinary(mr["clarity"]),
            trinary(mr["passion"]),
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

    pipeline := []interface{}{Courses, Profs, Users, CourseReviews, ProfReviews}
    for i := range pipeline {
        pipeline[i].(func(*sqlx.DB, string, map[string]bson.M))(db, rootPath, idMap)
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
