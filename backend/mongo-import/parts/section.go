package parts

import (
  "encoding/json"
	"io/ioutil"
	"path"
  "strconv"

	"github.com/jmoiron/sqlx"
	"go.mongodb.org/mongo-driver/bson"
	"gopkg.in/cheggaaa/pb.v1"
)

const SectionQuery = `UPDATE course
SET sections = COALESCE(sections, '[]'::JSONB) || $1
WHERE id = $2`

type MongoMeeting struct {
  Days []string `bson:"days"`
  StartSeconds int `bson:"start_seconds"`
  EndSeconds int `bson:"end_seconds"`
  IsCancelled bool `bson:"is_cancelled"`
  IsClosed bool `bson:"is_closed"`
  IsTBA bool `bson:"is_tba"`
  ProfId string `bson:"prof_id"`
  Building string `bson:"building"`
  Room string `bson:"room"`
}

type MongoSection struct {
  CourseId string `bson:"course_id"`
  Campus string `bson:"campus"`
  ClassNumber string `bson:"class_num"`
  SectionType string `bson:"section_type"`
  SectionNumber string `bson:"section_num"`
  EnrollmentCapacity int `bson:"enrollment_capacity"`
  EnrollmentTotal int `bson:"enrollment_total"`
  TermId string `bson:"term_id"`
  Meetings []MongoMeeting `bson:"meetings"`
}

type PostgresClass struct {
  StartSeconds int `json:"start_seconds",omitempty`
  EndSeconds int `json:"end_seconds",omitempty`
  Days []string `json:"days"`
  IsCancelled bool `json:"is_cancelled"`
  IsClosed bool `json:"is_closed"`
  IsTBA bool `json:"is_tba"`
  ProfId int `json:"prof_id",omitempty`
  Location string `json:"location",omitempty`
}

type PostgresSection struct {
  Campus string `json:"campus"`
  ClassNumber int `json:"class_number"`
  SectionName string `json:"section"`
  EnrollmentCapacity int `json:"enrollment_capacity"`
  EnrollmentTotal int `json:"enrollment_total"`
  TermId int `json:"term"`
  Classes []PostgresClass
}

func readMongoSections(rootPath string) []MongoSection {
	data, err := ioutil.ReadFile(path.Join(rootPath, "section.bson"))
  if err != nil {
    panic(err)
  }

	var sections []MongoSection
	for len(data) > 0 {
		var r bson.Raw
		var m MongoSection
    bson.Unmarshal(data, &r)
		bson.Unmarshal(r, &m)
		sections = append(sections, m)
		data = data[len(r):]
	}
	return sections
}

func ConvertMeeting(meeting MongoMeeting, idMap map[string]bson.M) PostgresClass {
  class := PostgresClass{
    Days: meeting.Days,
    IsCancelled: meeting.IsCancelled,
    IsClosed: meeting.IsClosed,
    IsTBA: meeting.IsTBA,
    StartSeconds: meeting.StartSeconds
    EndSeconds: meeting.EndSeconds
  }
  if profId, ok := idMap["prof"][meeting.ProfId]; ok {
    class.ProfId = profId.(int)
  }
  if meeting.Building != "" {
    class.Location = meeting.Building + " " + meeting.Room
  }
  return class
}

func ConvertTermId(termId string) (id int, ok bool) {
  for i := range termId {
    if termId[i] == '_' {
      year, _ := strconv.Atoi(termId[:i])
      month, _ := strconv.Atoi(termId[i+1:])
      return 1000 + (year % 100) * 10 + month, true
    }
  }
  return 0, false
}

func ConvertSection(section MongoSection, idMap map[string]bson.M) PostgresSection {
  classes := make([]PostgresClass, len(section.Meetings))
  for i, meeting := range section.Meetings {
    classes[i] = ConvertMeeting(meeting, idMap)
  }
  termId, _ := ConvertTermId(section.TermId)
  classNumber, _ := strconv.Atoi(section.ClassNumber)

  return PostgresSection{
    Campus: section.Campus,
    ClassNumber: classNumber,
    SectionName: section.SectionType + " " + section.SectionNumber,
    EnrollmentCapacity: section.EnrollmentCapacity,
    EnrollmentTotal: section.EnrollmentTotal,
    TermId: termId,
    Classes: classes,
  }
}

func ImportSections(db *sqlx.DB, rootPath string, idMap map[string]bson.M) error {
	tx := db.MustBegin()
	sections := readMongoSections(rootPath)

  bar := pb.StartNew(len(sections))
  for _, section := range sections {
    bar.Increment()
    courseId := idMap["course"][section.CourseId]
    postgresSection := ConvertSection(section, idMap)
    sectionJson, err := json.Marshal(postgresSection)
    if err != nil {
      return err
    }
    tx.MustExec(SectionQuery, sectionJson, courseId)
  }
  err := tx.Commit()
  bar.FinishPrint("Sections finished")
  return err
}
