package parts

import (
	"io/ioutil"
	"path"
	"strings"

	"github.com/jackc/pgx"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"gopkg.in/cheggaaa/pb.v1"
)

type MongoUser struct {
	Id        primitive.ObjectID `bson:"_id"`
	FirstName string             `bson:"first_name"`
	LastName  string             `bson:"last_name"`
}

func readMongoUsers(rootPath string) []MongoUser {
	data, err := ioutil.ReadFile(path.Join(rootPath, "user.bson"))
	if err != nil {
		panic(err)
	}

	var users []MongoUser
	for len(data) > 0 {
		var r bson.Raw
		var m MongoUser
		bson.Unmarshal(data, &r)
		bson.Unmarshal(r, &m)
		users = append(users, m)
		data = data[len(r):]
	}
	return users
}

func ImportUsers(db *pgx.Conn, rootPath string, idMap *IdentifierMap) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec("TRUNCATE \"user\" CASCADE")
	if err != nil {
		return err
	}
	idMap.User = make(map[primitive.ObjectID]int)
	users := readMongoUsers(rootPath)
	preparedUsers := make([][]interface{}, len(users))

	bar := pb.StartNew(len(users))
	for i, user := range users {
		bar.Increment()
		userName := strings.TrimSpace(user.FirstName + " " + user.LastName)
		idMap.User[user.Id] = i + 1
		preparedUsers[i] = []interface{}{i + 1, userName}
	}

	_, err = tx.CopyFrom(
		pgx.Identifier{"user"},
		[]string{"id", "name"},
		pgx.CopyFromRows(preparedUsers),
	)
	if err != nil {
		return err
	}

	err = tx.Commit()
	if err != nil {
		return err
	}
	bar.FinishPrint("Importing users finished")
	return nil
}
