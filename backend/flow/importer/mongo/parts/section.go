package parts

import (
	"io/ioutil"
	"path"
	"strconv"
	"time"

	"flow/common/db"
	"flow/common/state"
	"flow/common/util"
	"flow/importer/mongo/log"

	"go.mongodb.org/mongo-driver/bson"
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

type Timeframe struct {
	StartDate *time.Time
	EndDate   *time.Time
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
		postgresMeeting.Location = util.StringToPointer(
			*meeting.Building + " " + *meeting.Room,
		)
	}
	return postgresMeeting
}

func ConvertSection(section MongoSection, idMap *IdentifierMap, terms map[int]Timeframe) PostgresSection {
	termId, _ := util.TermYearMonthToId(section.TermId)
	classNumber, _ := strconv.Atoi(section.ClassNumber)

	meetings := make([]PostgresMeeting, len(section.Meetings))
	for i, mongoMeeting := range section.Meetings {
		meetings[i] = ConvertMeeting(mongoMeeting, idMap)
		if meetings[i].StartDate == nil || meetings[i].EndDate == nil {
			meetings[i].StartDate = terms[termId].StartDate
			meetings[i].EndDate = terms[termId].EndDate
		}
	}

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

func ImportSections(state *state.State, idMap *IdentifierMap) error {
  log.StartImport(state.Log, "course_section")
  log.StartImport(state.Log, "section_meeting")

	tx, err := state.Db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var preparedSections [][]interface{}
	var preparedMeetings [][]interface{}
	mongoSections := readMongoSections(state.Env.MongoDumpPath)
	idMap.Section = make(map[SectionKey]int)
	terms := make(map[int]Timeframe)

	rows, err := tx.Query(`SELECT term, start_date, end_date FROM term_date`)
	if err != nil {
		return nil
	}
	defer rows.Close()

	for rows.Next() {
		var termId int
		var startDate, endDate *time.Time
		rows.Scan(&termId, &startDate, &endDate)
		terms[termId] = Timeframe{StartDate: startDate, EndDate: endDate}
	}

	sectionId := 1
	for _, mongoSection := range mongoSections {
		courseId, courseFound := idMap.Course[mongoSection.CourseId]
		if !courseFound {
			continue // We cannot do anything for missing courses
		}

		section := ConvertSection(mongoSection, idMap, terms)
		preparedSections = append(
			preparedSections,
			[]interface{}{
				section.ClassNumber,
				courseId,
				section.SectionName,
				section.Campus,
				section.TermId,
				section.EnrollmentCapacity,
				section.EnrollmentTotal,
			},
		)
		key := SectionKey{
			ClassNumber: section.ClassNumber,
			TermId:      section.TermId,
		}
		idMap.Section[key] = sectionId

		for _, meeting := range section.Meetings {
			preparedMeetings = append(
				preparedMeetings,
				[]interface{}{
					sectionId,
					meeting.ProfId,
					meeting.StartDate,
					meeting.EndDate,
					meeting.StartSeconds,
					meeting.EndSeconds,
					meeting.Location,
					meeting.Days,
					meeting.IsCancelled,
					meeting.IsClosed,
					meeting.IsTba,
				},
			)
		}
		sectionId += 1
	}

  sectionCount, err := tx.CopyFrom(
		db.Identifier{"course_section"},
		[]string{
			"class_number", "course_id", "section", "campus",
			"term", "enrollment_capacity", "enrollment_total",
		},
		preparedSections,
	)
	if err != nil {
		return err
	}
  log.EndImport(state.Log, "course_section", sectionCount)

  meetingCount, err := tx.CopyFrom(
		db.Identifier{"section_meeting"},
		[]string{
			"section_id", "prof_id", "start_date", "end_date", "start_seconds", "end_seconds",
			"location", "days", "is_cancelled", "is_closed", "is_tba",
		},
		preparedMeetings,
	)
	if err != nil {
		return err
	}
  log.EndImport(state.Log, "section_meeting", meetingCount)

	return tx.Commit()
}
