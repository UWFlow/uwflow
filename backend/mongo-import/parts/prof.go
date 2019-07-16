package parts

import (
	"io/ioutil"
	"path"
	"strings"

	"github.com/jackc/pgx"
	"go.mongodb.org/mongo-driver/bson"
	"gopkg.in/cheggaaa/pb.v1"
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

func ImportProfs(conn *pgx.Conn, rootPath string, idMap *IdentifierMap) error {
	tx, err := conn.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec("TRUNCATE prof CASCADE")
	if err != nil {
		return err
	}
	idMap.Prof = make(map[string]int)
	profs := readMongoProfs(rootPath)
	preparedProfs := make([][]interface{}, len(profs))

	bar := pb.StartNew(len(profs))
	for i, prof := range profs {
		bar.Increment()
		profName := strings.TrimSpace(prof.FirstName + " " + prof.LastName)
		idMap.Prof[prof.Id] = i + 1
		preparedProfs[i] = []interface{}{i + 1, profName}
	}

	_, err = tx.CopyFrom(
		pgx.Identifier{"prof"},
		[]string{"id", "name"},
		pgx.CopyFromRows(preparedProfs),
	)
	if err != nil {
		return err
	}
	err = tx.Commit()
	if err != nil {
		return err
	}
	bar.FinishPrint("Import profs finished")
	return nil
}
