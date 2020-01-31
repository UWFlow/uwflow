package parts

import (
	"encoding/csv"
	"io/ioutil"
	"os"
	"path"
	"strings"

	"flow/common/db"
	"flow/common/state"
	"flow/common/util"
	"flow/importer/mongo/data"
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

	var preparedProfs [][]interface{}
	var profId = 1
	for _, prof := range profs {
		var profCode, profName string
		if rename, ok := idMap.ProfRename[prof.Id]; ok {
			if rename.Delete {
				continue
			}
			profCode = rename.NewCode
			profName = rename.NewName
		} else {
			profCode = prof.Id
			profName = strings.TrimSpace(prof.FirstName + " " + prof.LastName)
		}
		if oldId, ok := idMap.Prof[profCode]; ok {
			idMap.Prof[prof.Id] = oldId
		} else {
			preparedProfs = append(preparedProfs, []interface{}{profName, profCode})
			idMap.Prof[prof.Id] = profId
			idMap.Prof[profCode] = profId
			profId += 1
		}
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

func readProfRenames(rootPath string) map[string]data.ProfRename {
	f, err := os.Open(path.Join(rootPath, "prof_mapping.csv"))
	if err != nil {
		panic(err)
	}

	cf := csv.NewReader(f)
	rows, err := cf.ReadAll()
	if err != nil {
		panic(err)
	}

	var profMap = make(map[string]data.ProfRename)
	for _, row := range rows {
		if row[2] != "" || row[3] != "" || row[4] != "" {
			if row[2] == "" {
				row[2] = row[0]
			}
			if row[3] == "" {
				row[3] = row[1]
			}
			profMap[row[0]] = data.ProfRename{
				OldCode: row[0],
				OldName: row[1],
				NewCode: row[2],
				NewName: row[3],
				Delete:  row[4] == "DELETE",
			}
		}
	}

	return profMap
}

func ImportProfRenames(state *state.State, idMap *IdentifierMap) error {
	log.StartImport(state.Log, "prof_rename")

	tx, err := state.Db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	idMap.ProfRename = readProfRenames(state.Env.MongoDumpPath)
	preparedRenames := make([][]interface{}, len(idMap.ProfRename))

	i := 0
	for _, rename := range idMap.ProfRename {
		preparedRenames[i] = util.AsSlice(rename)
		i++
	}

	count, err := tx.CopyFrom(
		db.Identifier{"prof_rename"},
		util.Fields(idMap.ProfRename),
		preparedRenames,
	)
	if err != nil {
		return err
	}
	log.EndImport(state.Log, "prof_rename", count)

	return tx.Commit()
}
