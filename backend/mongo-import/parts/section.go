package parts

import (
	"encoding/json"
	"io/ioutil"
	"path"
	"strconv"

	"github.com/jackc/pgx"
	"go.mongodb.org/mongo-driver/bson"
	"gopkg.in/cheggaaa/pb.v1"

	"github.com/AyushK1/uwflow2.0/backend/mongo-import/convert"
)

type MongoMeeting struct {
	Days         []string `bson:"days"`
	IsCancelled  bool     `bson:"is_cancelled"`
	IsClosed     bool     `bson:"is_closed"`
	IsTBA        bool     `bson:"is_tba"`
	StartSeconds *int     `bson:"start_seconds"`
	EndSeconds   *int     `bson:"end_seconds"`
	ProfId       *string  `bson:"prof_id"`
	Building     *string  `bson:"building"`
	Room         *string  `bson:"room"`
}

type MongoSection struct {
	CourseId           string         `bson:"course_id"`
	Campus             string         `bson:"campus"`
	ClassNumber        string         `bson:"class_num"`
	SectionType        string         `bson:"section_type"`
	SectionNumber      string         `bson:"section_num"`
	EnrollmentCapacity int            `bson:"enrollment_capacity"`
	EnrollmentTotal    int            `bson:"enrollment_total"`
	TermId             string         `bson:"term_id"`
	Meetings           []MongoMeeting `bson:"meetings"`
}

type PostgresClass struct {
	Days         []string `json:"days"`
	IsCancelled  bool     `json:"is_cancelled"`
	IsClosed     bool     `json:"is_closed"`
	IsTBA        bool     `json:"is_tba"`
	StartSeconds *int     `json:"start_seconds",omitempty`
	EndSeconds   *int     `json:"end_seconds",omitempty`
	ProfId       *int     `json:"prof_id",omitempty`
	Location     *string  `json:"location",omitempty`
}

type PostgresSection struct {
	Campus             string          `json:"campus"`
	ClassNumber        int             `json:"class_number"`
	SectionName        string          `json:"section"`
	EnrollmentCapacity int             `json:"enrollment_capacity"`
	EnrollmentTotal    int             `json:"enrollment_total"`
	TermId             int             `json:"term"`
	Classes            []PostgresClass `json:"classes"`
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

func ConvertMeeting(meeting MongoMeeting, idMap *IdentifierMap) PostgresClass {
	class := PostgresClass{
		Days:         meeting.Days,
		IsCancelled:  meeting.IsCancelled,
		IsClosed:     meeting.IsClosed,
		IsTBA:        meeting.IsTBA,
		StartSeconds: meeting.StartSeconds,
		EndSeconds:   meeting.EndSeconds,
	}
	if meeting.ProfId != nil {
		if profId, ok := idMap.Prof[*(meeting.ProfId)]; ok {
			class.ProfId = &profId
		}
	}
	if meeting.Building != nil && meeting.Room != nil {
		location := *meeting.Building + " " + *meeting.Room
		class.Location = &location
	}
	return class
}

func ConvertSection(section MongoSection, idMap *IdentifierMap) PostgresSection {
	classes := make([]PostgresClass, len(section.Meetings))
	for i, meeting := range section.Meetings {
		classes[i] = ConvertMeeting(meeting, idMap)
	}
	termId, _ := convert.MongoToPostgresTerm(section.TermId)
	classNumber, _ := strconv.Atoi(section.ClassNumber)

	return PostgresSection{
		Campus:             section.Campus,
		ClassNumber:        classNumber,
		SectionName:        section.SectionType + " " + section.SectionNumber,
		EnrollmentCapacity: section.EnrollmentCapacity,
		EnrollmentTotal:    section.EnrollmentTotal,
		TermId:             termId,
		Classes:            classes,
	}
}

func ImportSections(db *pgx.Conn, rootPath string, idMap *IdentifierMap) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	sections := readMongoSections(rootPath)
	// We cannot use CopyFrom here, as this is an update of an existing field.
	// This is no tragedy: prepared statements are still quite fast.
	_, err = tx.Prepare(
		"update_course",
		"UPDATE course SET sections = COALESCE(sections, '[]'::JSONB) || $1 WHERE id = $2",
	)
	if err != nil {
		return err
	}
	// While we are at it, we will avoid using CopyFrom for prof_course as well.
	// It would be faster, but we would have to reify ON CONFLIECT DO NOTHING.
	// CopyFrom makes more sense on very heavy imports, that is reviews.
	_, err = tx.Prepare(
		"insert_prof_course",
		"INSERT INTO prof_course(prof_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
	)
	if err != nil {
		return err
	}

	bar := pb.StartNew(len(sections))
	for _, section := range sections {
		bar.Increment()
		courseId, courseFound := idMap.Course[section.CourseId]
		if !courseFound {
			continue // We cannot do anything for missing courses
		}

		postgresSection := ConvertSection(section, idMap)
		for _, class := range postgresSection.Classes {
			if class.ProfId != nil {
				_, err = tx.Exec("insert_prof_course", *(class.ProfId), courseId)
				if err != nil {
					return err
				}
			}
		}

		sectionJson, err := json.Marshal(postgresSection)
		if err != nil {
			return err
		}
		_, err = tx.Exec("update_course", sectionJson, courseId)
		if err != nil {
			return err
		}
	}
	err = tx.Commit()
	if err != nil {
		return err
	}
	bar.FinishPrint("Sections finished")
	return err
}
