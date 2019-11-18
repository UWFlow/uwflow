package parts

import (
	"io/ioutil"
	"path"
	"strings"

	"flow/common/state"

	"github.com/jackc/pgx/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MongoUser struct {
	Id          primitive.ObjectID `bson:"_id"`
	FirstName   string             `bson:"first_name"`
	LastName    string             `bson:"last_name"`
	ProgramName *string            `bson:"program_name"`
	Email       *string            `bson:"email"`
	Password    *string            `bson:"password"`
	FBId        *string            `bson:"fbid"`
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

func ImportUsers(state *state.State, idMap *IdentifierMap) error {
	tx, err := state.Db.Begin(state.Ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(state.Ctx)

	idMap.User = make(map[primitive.ObjectID]int)
	users := readMongoUsers(state.Env.MongoDumpPath)
	preparedUsers := make([][]interface{}, len(users))

	var emailCredentials [][]interface{}
	var fbCredentials [][]interface{}

	for i, user := range users {
		fullName := strings.TrimSpace(user.FirstName + " " + user.LastName)
		idMap.User[user.Id] = i + 1
		// If the program name is longer than 256 characters,
		// it's almost certainly not actually a program name.
		// We have some users with entire transcipts as "program names".
		// We take the liberty of dropping such long strings here.
		if user.ProgramName != nil && len(*user.ProgramName) > 256 {
			user.ProgramName = nil
		}

		// Only add email users with valid email and password
		// Not sure why there are email users without password?
		if user.Email != nil && user.Password != nil && len(*user.Password) == 60 {
			preparedUsers[i] = []interface{}{fullName, user.ProgramName, user.Email, "email"}
			emailCredentials = append(emailCredentials, []interface{}{i + 1, user.Password})
		}

		if user.FBId != nil {
			preparedUsers[i] = []interface{}{fullName, user.ProgramName, user.Email, "facebook"}
			fbCredentials = append(fbCredentials, []interface{}{i + 1, user.FBId})
		}
	}

	_, err = tx.CopyFrom(
		state.Ctx,
		pgx.Identifier{"user"},
		[]string{"full_name", "program", "email", "join_source"},
		pgx.CopyFromRows(preparedUsers),
	)
	if err != nil {
		return err
	}

	_, err = tx.CopyFrom(
		state.Ctx,
		pgx.Identifier{"secret", "user_email"},
		[]string{"user_id", "password_hash"},
		pgx.CopyFromRows(emailCredentials),
	)
	if err != nil {
		return err
	}

	_, err = tx.CopyFrom(
		state.Ctx,
		pgx.Identifier{"secret", "user_fb"},
		[]string{"user_id", "fb_id"},
		pgx.CopyFromRows(fbCredentials),
	)
	if err != nil {
		return err
	}

	return tx.Commit(state.Ctx)
}
