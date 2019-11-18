package parts

import (
	"io/ioutil"
	"path"
	"strings"

	"flow/common/state"

	"github.com/jackc/pgx/v4"
	"go.mongodb.org/mongo-driver/bson"
)

type MongoProf struct {
	Id        string `bson:"_id"`
	FirstName string `bson:"first_name"`
	LastName  string `bson:"last_name"`
}

func readMongoProfs(rootPath string) []MongoProf {
	data, err := ioutil.ReadFile(path.Join(rootPath, "professor.bson"))
	if err != nil {
		panic(err)
	}

	var profs []MongoProf
	for len(data) > 0 {
		var r bson.Raw
		var m MongoProf
		bson.Unmarshal(data, &r)
		bson.Unmarshal(r, &m)
		profs = append(profs, m)
		data = data[len(r):]
	}
	return profs
}

func ImportProfs(state *state.State, idMap *IdentifierMap) error {
	tx, err := state.Db.Begin(state.Ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(state.Ctx)

	idMap.Prof = make(map[string]int)
	profs := readMongoProfs(state.Env.MongoDumpPath)
	preparedProfs := make([][]interface{}, len(profs))

	for i, prof := range profs {
		profName := strings.TrimSpace(prof.FirstName + " " + prof.LastName)
		idMap.Prof[prof.Id] = i + 1
		preparedProfs[i] = []interface{}{profName, prof.Id}
	}

	_, err = tx.CopyFrom(
		state.Ctx,
		pgx.Identifier{"prof"},
		[]string{"name", "code"},
		pgx.CopyFromRows(preparedProfs),
	)
	if err != nil {
		return err
	}

	return tx.Commit(state.Ctx)
}
