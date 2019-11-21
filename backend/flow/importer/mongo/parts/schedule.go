package parts

import (
	"io/ioutil"
	"path"
	"strconv"

	"flow/common/db"
	"flow/common/state"
	"flow/common/util"
	"flow/importer/mongo/log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MongoSchedule struct {
	UserId      primitive.ObjectID `bson:"user_id"`
	ClassNumber string             `bson:"class_num"`
	TermId      string             `bson:"term_id"`
}

func readMongoSchedules(rootPath string) []MongoSchedule {
	data, err := ioutil.ReadFile(path.Join(rootPath, "user_schedule_item.bson"))
	if err != nil {
		panic(err)
	}

	var schedules []MongoSchedule
	for len(data) > 0 {
		var r bson.Raw
		var m MongoSchedule
		bson.Unmarshal(data, &r)
		bson.Unmarshal(r, &m)
		schedules = append(schedules, m)
		data = data[len(r):]
	}
	return schedules
}

func ImportSchedules(state *state.State, idMap *IdentifierMap) error {
	log.StartImport(state.Log, "user_schedule")

	tx, err := state.Db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	schedules := readMongoSchedules(state.Env.MongoDumpPath)
	preparedSchedules := make([][]interface{}, 0)
	seen := make(map[IntPair]bool)

	for _, schedule := range schedules {
		// If either user or section do not exist, continue
		userId, userFound := idMap.User[schedule.UserId]
		// Class number is definitely an integer
		classNumber, _ := strconv.Atoi(schedule.ClassNumber)
		// And this is definitely a valid term id
		termId, _ := util.TermYearMonthToId(schedule.TermId)

		sectionId, sectionFound := idMap.Section[SectionKey{classNumber, termId}]
		if !userFound || !sectionFound {
			continue
		}

		if seen[IntPair{userId, sectionId}] {
			continue
		} else {
			seen[IntPair{userId, sectionId}] = true
		}

		preparedSchedules = append(
			preparedSchedules,
			[]interface{}{
				userId,
				sectionId,
			},
		)
	}

	count, err := tx.CopyFrom(
		db.Identifier{"user_schedule"},
		[]string{"user_id", "section_id"},
		preparedSchedules,
	)
	if err != nil {
		return err
	}
	log.EndImport(state.Log, "user_schedule", count)

	return tx.Commit()
}
