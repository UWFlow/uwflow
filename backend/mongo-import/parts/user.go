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
  ProgramName *string          `bson:"program_name"`
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
		fullName := strings.TrimSpace(user.FirstName + " " + user.LastName)
		idMap.User[user.Id] = i + 1
    // If the program name is longer than 256 characters,
    // it's almost certainly not actually a program name.
    // We have some users with entire transcipts as "program names".
    // We take the liberty of dropping such long string here.
    if user.ProgramName != nil && len(*user.ProgramName) > 256 {
      user.ProgramName = nil
    }
		preparedUsers[i] = []interface{}{i + 1, fullName, user.ProgramName}
	}

	_, err = tx.CopyFrom(
		pgx.Identifier{"user"},
		[]string{"id", "full_name", "program"},
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
