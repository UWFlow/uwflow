package data

import "time"

type Review struct {
	CourseId      int
	UserId        int
	ProfId        *int
	Liked         *int16
	CourseEasy    *int16
	CourseUseful  *int16
	CourseComment *string
	ProfClear     *int16
	ProfEngaging  *int16
	ProfComment   *string
	Public        bool
	CreatedAt     *time.Time
	UpdatedAt     *time.Time
}
