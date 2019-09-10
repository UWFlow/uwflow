package parts

import (
	"io/ioutil"
	"path"
	"strconv"
	"time"

	"github.com/jackc/pgx"
	"go.mongodb.org/mongo-driver/bson"
	"gopkg.in/cheggaaa/pb.v1"

	"github.com/AyushK1/uwflow2.0/backend/mongo-import/convert"
)

type MongoMeeting struct {
	Days         []string   `bson:"days"`
	IsCancelled  bool       `bson:"is_cancelled"`
	IsClosed     bool       `bson:"is_closed"`
	IsTba        bool       `bson:"is_tba"`
	StartDate    *time.Time `bson:"start_date"`
	EndDate      *time.Time `bson:"end_date"`
	StartSeconds *int       `bson:"start_seconds"`
	EndSeconds   *int       `bson:"end_seconds"`
	ProfId       *string    `bson:"prof_id"`
	Building     *string    `bson:"building"`
	Room         *string    `bson:"room"`
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

type PostgresMeeting struct {
	Days         []string
	IsCancelled  bool
	IsClosed     bool
	IsTba        bool
	StartDate    *time.Time
	EndDate      *time.Time
	StartSeconds *int
	EndSeconds   *int
	ProfId       *int
	Location     *string
}

type PostgresSection struct {
	ClassNumber        int
	SectionName        string
	Campus             string
	TermId             int
	EnrollmentCapacity int
	EnrollmentTotal    int
	Meetings           []PostgresMeeting
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

func ConvertMeeting(meeting MongoMeeting, idMap *IdentifierMap) PostgresMeeting {
	postgresMeeting := PostgresMeeting{
		Days:         meeting.Days,
		IsCancelled:  meeting.IsCancelled,
		IsClosed:     meeting.IsClosed,
		IsTba:        meeting.IsTba,
		StartDate:    meeting.StartDate,
		EndDate:      meeting.EndDate,
		StartSeconds: meeting.StartSeconds,
		EndSeconds:   meeting.EndSeconds,
	}
	if meeting.ProfId != nil {
		if profId, ok := idMap.Prof[*(meeting.ProfId)]; ok {
			postgresMeeting.ProfId = &profId
		}
	}
	if meeting.Building != nil && meeting.Room != nil {
		location := *meeting.Building + " " + *meeting.Room
		postgresMeeting.Location = &location
	}
	return postgresMeeting
}

func ConvertSection(section MongoSection, idMap *IdentifierMap) PostgresSection {
	meetings := make([]PostgresMeeting, len(section.Meetings))
	for i, mongoMeeting := range section.Meetings {
		meetings[i] = ConvertMeeting(mongoMeeting, idMap)
	}
	termId, _ := convert.MongoToPostgresTerm(section.TermId)
	classNumber, _ := strconv.Atoi(section.ClassNumber)

	return PostgresSection{
		ClassNumber:        classNumber,
		SectionName:        section.SectionType + " " + section.SectionNumber,
		Campus:             section.Campus,
		TermId:             termId,
		EnrollmentCapacity: section.EnrollmentCapacity,
		EnrollmentTotal:    section.EnrollmentTotal,
		Meetings:           meetings,
	}
}

func ImportSections(db *pgx.Conn, rootPath string, idMap *IdentifierMap) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	sections := readMongoSections(rootPath)
	preparedSections := make([][]interface{}, 0, len(sections))
	// For pre-allocation, say each course has on average 3 meetings or more
	preparedMeetings := make([][]interface{}, 0, 3*len(sections))
	idMap.Section = make(map[SectionKey]int)

	// We will avoid using CopyFrom for prof_course.
	// It would be faster, but we would have to reify ON CONFLIECT DO NOTHING.
	// CopyFrom makes more sense on very heavy imports like reviews.
	_, err = tx.Prepare(
		"insert_prof_course",
		"INSERT INTO prof_course(prof_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
	)
	if err != nil {
		return err
	}

	bar := pb.StartNew(len(sections))
	sectionId := 1
	for _, section := range sections {
		bar.Increment()
		courseId, courseFound := idMap.Course[section.CourseId]
		if !courseFound {
			continue // We cannot do anything for missing courses
		}

		postgresSection := ConvertSection(section, idMap)
		preparedSections = append(
			preparedSections,
			[]interface{}{
				postgresSection.ClassNumber,
				courseId,
				postgresSection.SectionName,
				postgresSection.Campus,
				postgresSection.TermId,
				postgresSection.EnrollmentCapacity,
				postgresSection.EnrollmentTotal,
			},
		)
		key := SectionKey{
			ClassNumber: postgresSection.ClassNumber,
			TermId:      postgresSection.TermId,
		}
		idMap.Section[key] = sectionId

		for _, postgresMeeting := range postgresSection.Meetings {
			preparedMeetings = append(
				preparedMeetings,
				[]interface{}{
					sectionId,
					postgresMeeting.ProfId,
					postgresMeeting.StartDate,
					postgresMeeting.EndDate,
					postgresMeeting.StartSeconds,
					postgresMeeting.EndSeconds,
					postgresMeeting.Location,
					postgresMeeting.Days,
					postgresMeeting.IsCancelled,
					postgresMeeting.IsClosed,
					postgresMeeting.IsTba,
				},
			)

			if postgresMeeting.ProfId != nil {
				_, err = tx.Exec("insert_prof_course", *(postgresMeeting.ProfId), courseId)
				if err != nil {
					return err
				}
			}
		}
		sectionId += 1
	}

	_, err = tx.CopyFrom(
		pgx.Identifier{"course_section"},
		[]string{
			"class_number", "course_id", "section", "campus",
			"term", "enrollment_capacity", "enrollment_total",
		},
		pgx.CopyFromRows(preparedSections),
	)
	if err != nil {
		return err
	}

	_, err = tx.CopyFrom(
		pgx.Identifier{"section_meeting"},
		[]string{
			"section_id", "prof_id", "start_date", "end_date", "start_seconds", "end_seconds",
			"location", "days", "is_cancelled", "is_closed", "is_tba",
		},
		pgx.CopyFromRows(preparedMeetings),
	)
	if err != nil {
		return err
	}

	err = tx.Commit()
	if err != nil {
		return err
	}
	bar.FinishPrint("Sections finished")
	return err
}
