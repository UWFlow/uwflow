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

// The search dump must list every course/prof so the frontend can autocomplete
// against the full catalog. aggregate.course_rating / aggregate.prof_rating are
// backed by materialized views that are only refreshed by triggers on review and
// section_meeting writes, so they can be stale or empty (e.g. a freshly seeded
// DB). LEFT JOIN keeps the live course/prof tables as the source of truth and
// COALESCE defaults the rating count to 0 when the matview has no row yet.
const courseQuery = `
SELECT
  c.id, c.code, c.name, COALESCE(cr.filled_count, 0) AS review_count,
  COALESCE(ARRAY_AGG(p.name) FILTER (WHERE p.id IS NOT NULL), ARRAY[]::TEXT[]) AS profs
FROM course c
  LEFT JOIN aggregate.course_rating cr ON cr.course_id = c.id
  LEFT JOIN prof_teaches_course pc ON pc.course_id = c.id
  LEFT JOIN prof p ON p.id = pc.prof_id
GROUP BY c.id, cr.filled_count
`

const profQuery = `
SELECT
  p.id, p.code, p.name, COALESCE(pr.filled_count, 0) AS review_count,
  COALESCE(ARRAY_AGG(c.code) FILTER (WHERE c.id IS NOT NULL), ARRAY[]::TEXT[]) AS courses
FROM prof p
  LEFT JOIN aggregate.prof_rating pr ON pr.prof_id = p.id
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
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating course rows: %w", err)
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
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating prof rows: %w", err)
	}

	return &response, nil
}
