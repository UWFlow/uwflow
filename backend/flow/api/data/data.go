package data

import (
	"fmt"
	"net/http"

	"flow/common/db"
)

type course struct {
	Id          int      `json:"id"`
	Code        string   `json:"code"`
	Name        string   `json:"name"`
	Profs       []string `json:"profs"`
	RatingCount int      `json:"rating_count"`
}

type prof struct {
	Id          int      `json:"id"`
	Code        string   `json:"code"`
	Name        string   `json:"name"`
	Courses     []string `json:"courses"`
	RatingCount int      `json:"rating_count"`
}

type dumpResponse struct {
	Courses []course `json:"courses"`
	Profs   []prof   `json:"profs"`
}

const courseQuery = `
SELECT
  c.id, c.code, c.name, cr.filled_count AS review_count,
  COALESCE(ARRAY_AGG(p.name) FILTER (WHERE p.id IS NOT NULL), ARRAY[]::TEXT[]) AS profs
FROM course c
 INNER JOIN aggregate.course_rating cr ON cr.course_id = c.id
  LEFT JOIN prof_teaches_course pc ON pc.course_id = c.id
  LEFT JOIN prof p ON p.id = pc.prof_id
GROUP BY c.id, cr.filled_count
`

const profQuery = `
SELECT
  p.id, p.code, p.name, pr.filled_count AS review_count,
  COALESCE(ARRAY_AGG(c.code) FILTER (WHERE c.id IS NOT NULL), ARRAY[]::TEXT[]) AS courses
FROM prof p
 INNER JOIN aggregate.prof_rating pr ON pr.prof_id = p.id
  LEFT JOIN prof_teaches_course pc ON pc.prof_id = p.id
  LEFT JOIN course c ON c.id = pc.course_id
GROUP BY p.id, pr.filled_count
`

func HandleSearch(tx *db.Tx, r *http.Request) (interface{}, error) {
	rows, err := tx.Query(courseQuery)
	if err != nil {
		return nil, fmt.Errorf("querying courses: %w", err)
	}
	defer rows.Close()

	var response dumpResponse
	for rows.Next() {
		var c course
		err = rows.Scan(&c.Id, &c.Code, &c.Name, &c.RatingCount, &c.Profs)
		if err != nil {
			return nil, fmt.Errorf("reading course row: %w", err)
		}
		response.Courses = append(response.Courses, c)
	}

	rows, err = tx.Query(profQuery)
	if err != nil {
		return nil, fmt.Errorf("querying profs: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var p prof
		err = rows.Scan(&p.Id, &p.Code, &p.Name, &p.RatingCount, &p.Courses)
		if err != nil {
			return nil, fmt.Errorf("reading prof row: %w", err)
		}
		response.Profs = append(response.Profs, p)
	}

	return &response, nil
}
