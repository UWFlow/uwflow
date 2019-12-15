package parts

import (
	"io/ioutil"
	"path"
	"strings"

	"flow/common/db"
	"flow/common/state"
	"flow/common/util"
	"flow/common/util/random"
	"flow/importer/mongo/log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const SecretIdLength = 16

type MongoUser struct {
	Id          primitive.ObjectID `bson:"_id"`
	FirstName   string             `bson:"first_name"`
	LastName    string             `bson:"last_name"`
	ProgramName *string            `bson:"program_name"`
	Email       *string            `bson:"email"`
	Password    *string            `bson:"password"`
	FbId        *string            `bson:"fbid"`
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

var programNameMap = map[string]*string{
	"Level: ":                        nil,
	"Graduate unofficial transcript": nil,
	"ComputerScience":                util.StringToPointer("Computer Science"),
	"ity of Waterloo 200 University Ave. West Waterloo Ontario Canada N2L3G1":               nil,
	"graduate Unofficial Transcript, Level: 1A, PostBaccalaureateDiplomainAccounting":       nil,
	"ScienceandBusiness/EarthSciences":                                                      util.StringToPointer("Science and Business/Earth Sciences"),
	"Penis Studies, Honours":                                                                nil,
	"(DoubleDegree)BusinessAdministration(WLU)andMathematics(UW)":                           util.StringToPointer("(Double Degree) Business Administration (WLU) and Mathematics (UW)"),
	"ComputerScience/BusinessOption":                                                        util.StringToPointer("Computer Science/Business Option"),
	"Will Be Determined At Graduation Time":                                                 nil,
	"bu Abah, Omar Wael":                                                                    nil,
	"GeographyandEnvironmentalManagement":                                                   util.StringToPointer("Geography and Environmental Management"),
	"Penis, Honours":                                                                        nil,
	"Mathematics/FinancialAnalysis&RiskManagement-CharteredFinancialAnalyst Specialization": util.StringToPointer("Mathematics/Financial Analysis & Rist Management - Chartered Finanacial Analyst Specialization"),
	"Sedra Smith, Honours":                                                                  nil,
	"Chen Studies, Honours":                                                                 nil,
}

func ImportUsers(state *state.State, idMap *IdentifierMap) error {
	log.StartImport(state.Log, "user")

	tx, err := state.Db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	idMap.User = make(map[primitive.ObjectID]int)
	users := readMongoUsers(state.Env.MongoDumpPath)
	preparedUsers := make([][]interface{}, len(users))

	var emailCredentials [][]interface{}
	var fbCredentials [][]interface{}

	for i, user := range users {
		secretId, _ := random.String(SecretIdLength, random.Uppercase)

		firstName := strings.TrimSpace(user.FirstName)
		lastName := strings.TrimSpace(user.LastName)
		idMap.User[user.Id] = i + 1

		if user.ProgramName != nil {
			programName := strings.TrimSpace(*user.ProgramName)
			// If the program name is longer than 256 characters,
			// it's almost certainly not actually a program name.
			// We have some users with entire transcipts as "program names".
			// We take the liberty of dropping such long strings here.
			if len(programName) > 256 {
				user.ProgramName = nil
				// If the name is one of the known bad names, map it to the correct one
			} else if val, found := programNameMap[programName]; found {
				user.ProgramName = val
				// If the name has a comma, then just use the part before it
			} else if idx := strings.IndexByte(programName, ','); idx != -1 {
				user.ProgramName = util.StringToPointer(programName[:idx])
				// Otherwise, just store the trimmed name
			} else {
				user.ProgramName = util.StringToPointer(programName)
			}
		}

		// Only add email users with valid email and password
		// Not sure why there are email users without password?
		if user.Email != nil && user.Password != nil && len(*user.Password) == 60 {
			preparedUsers[i] = []interface{}{
				secretId, firstName, lastName, user.ProgramName, user.Email, "email",
			}
			emailCredentials = append(emailCredentials, []interface{}{i + 1, user.Password})
		}

		if user.FbId != nil {
			preparedUsers[i] = []interface{}{
				secretId, firstName, lastName, user.ProgramName, user.Email, "facebook",
			}
			fbCredentials = append(fbCredentials, []interface{}{i + 1, user.FbId})
		}
	}

	userCount, err := tx.CopyFrom(
		db.Identifier{"user"},
		[]string{"secret_id", "first_name", "last_name", "program", "email", "join_source"},
		preparedUsers,
	)
	if err != nil {
		return err
	}
	log.EndImport(state.Log, "user", userCount)

	emailUserCount, err := tx.CopyFrom(
		db.Identifier{"secret", "user_email"},
		[]string{"user_id", "password_hash"},
		emailCredentials,
	)
	if err != nil {
		return err
	}
	log.EndImport(state.Log, "secret.user_email", emailUserCount)

	fbUserCount, err := tx.CopyFrom(
		db.Identifier{"secret", "user_fb"},
		[]string{"user_id", "fb_id"},
		fbCredentials,
	)
	if err != nil {
		return err
	}
	log.EndImport(state.Log, "secret.user_fb", fbUserCount)

	return tx.Commit()
}
