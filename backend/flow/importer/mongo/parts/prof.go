package parts

import (
	"io/ioutil"
	"path"
	"strings"

	"flow/common/db"
	"flow/common/state"
	"flow/importer/mongo/log"

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
  log.StartImport(state.Log, "prof")

	tx, err := state.Db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	idMap.Prof = make(map[string]int)
	profs := readMongoProfs(state.Env.MongoDumpPath)
	preparedProfs := make([][]interface{}, len(profs))

	for i, prof := range profs {
		profName := strings.TrimSpace(prof.FirstName + " " + prof.LastName)
		idMap.Prof[prof.Id] = i + 1
		preparedProfs[i] = []interface{}{profName, prof.Id}
	}

  count, err := tx.CopyFrom(
		db.Identifier{"prof"},
		[]string{"name", "code"},
		preparedProfs,
	)
	if err != nil {
		return err
	}
  log.EndImport(state.Log, "prof", count)

	return tx.Commit()
}
