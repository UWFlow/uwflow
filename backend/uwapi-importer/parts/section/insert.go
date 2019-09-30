package section

import "github.com/AyushK1/uwflow2.0/backend/uwapi-importer/db"

const InsertSectionQuery = `
INSERT INTO course_section(
  course_id,
  class_number, section, campus, term,
  enrollment_capacity, enrollment_total
)
SELECT
  course.id, $2, $3, $4, $5, $6, $7
  FROM course
  WHERE course.code = $1
ON CONFLICT (class_number, term)
DO UPDATE SET
  course_id = EXCLUDED.course_id,
  section = EXCLUDED.section,
  campus = EXCLUDED.campus,
  enrollment_capacity = EXCLUDED.enrollment_capacity,
  enrollment_total = EXCLUDED.enrollment_total
RETURNING id
`

func InsertSection(conn *db.Conn, section *Section) error {
	err := conn.QueryRow(
		InsertSectionQuery,
		section.CourseCode,
		section.ClassNumber, section.SectionName, section.Campus, section.TermId,
		section.EnrollmentCapacity, section.EnrollmentTotal,
	).Scan(&section.Id)
	return err
}

const InsertMeetingQuery = `
INSERT INTO section_meeting(
  section_id, prof_id, location,
  start_seconds, end_seconds, start_date, end_date, 
  days, is_cancelled, is_closed, is_tba
)
SELECT
  $1, prof.id, $3, $4, $5, $6, $7, $8, $9, $10, $11
  FROM prof
  WHERE prof.code = $2
`

func InsertMeeting(conn *db.Conn, meeting *Meeting) error {
	_, err := conn.Exec(
		InsertMeetingQuery,
		meeting.SectionId, meeting.ProfCode, meeting.Location,
		meeting.StartSeconds, meeting.EndSeconds, meeting.StartDate, meeting.EndDate,
		meeting.Days, meeting.IsCancelled, meeting.IsClosed, meeting.IsTba,
	)
	return err
}
