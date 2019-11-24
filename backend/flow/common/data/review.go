package data

import "time"

type Review struct {
	CourseId      int        `db:"course_id"`
	UserId        int        `db:"user_id"`
	ProfId        *int       `db:"prof_id"`
	Liked         *int16     `db:"liked"`
	CourseEasy    *int16     `db:"course_easy"`
	CourseUseful  *int16     `db:"course_useful"`
	CourseComment *string    `db:"course_comment"`
	ProfClear     *int16     `db:"prof_clear"`
	ProfEngaging  *int16     `db:"prof_engaging"`
	ProfComment   *string    `db:"prof_comment"`
	Public        bool       `db:"public"`
	CreatedAt     *time.Time `db:"created_at"`
	UpdatedAt     *time.Time `db:"updated_at"`
}
