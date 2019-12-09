package data

import (
	"encoding/json"
	"fmt"
	"net/http"

	"flow/api/serde"
	"flow/common/state"
)

type Course struct {
	Id          int      `json:"id"`
	Code        string   `json:"code"`
	Name        string   `json:"name"`
	Profs       []string `json:"profs"`
	RatingCount int      `json:"rating_count"`
}

type Prof struct {
	Id          int      `json:"id"`
	Code        string   `json:"code"`
	Name        string   `json:"name"`
	Courses     []string `json:"courses"`
	RatingCount int      `json:"rating_count"`
}

type Response struct {
	Courses []Course `json:"courses"`
	Profs   []Prof   `json:"profs"`
}

const CourseQuery = `
SELECT
  c.id, c.code, c.name, cr.filled_count AS review_count,
  ARRAY_AGG(p.name) FILTER (WHERE p.id IS NOT NULL) AS profs
FROM course c
 INNER JOIN aggregate.course_rating cr ON cr.course_id = c.id
  LEFT JOIN prof_teaches_course pc ON pc.course_id = c.id
  LEFT JOIN prof p ON p.id = pc.prof_id
GROUP BY c.id, cr.filled_count
`

const ProfQuery = `
SELECT p.id, p.code, p.name, pr.filled_count AS review_count,
ARRAY_AGG(c.code) FILTER (WHERE c.id IS NOT NULL) AS courses
FROM prof p
 INNER JOIN aggregate.prof_rating pr ON pr.prof_id = p.id
  LEFT JOIN prof_teaches_course pc ON pc.prof_id = p.id
  LEFT JOIN course c ON c.id = pc.course_id
GROUP BY p.id, pr.filled_count
`

func dump(state *state.State) (*Response, error) {
	rows, err := state.Db.Query(CourseQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to query database: %v", err)
	}
	defer rows.Close()

	var response Response
	for rows.Next() {
		var c Course
		err = rows.Scan(&c.Id, &c.Code, &c.Name, &c.RatingCount, &c.Profs)
		if err != nil {
			return nil, fmt.Errorf("failed to read rows: %v", err)
		}
		response.Courses = append(response.Courses, c)
	}

	rows, err = state.Db.Query(ProfQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to query database: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var p Prof
		err = rows.Scan(&p.Id, &p.Code, &p.Name, &p.RatingCount, &p.Courses)
		if err != nil {
			return nil, fmt.Errorf("failed to read rows: %v", err)
		}
		response.Profs = append(response.Profs, p)
	}

	return &response, nil
}

func HandleSearch(state *state.State, w http.ResponseWriter, r *http.Request) {
	res, err := dump(state)
	if err != nil {
		serde.Error(w, serde.WithEnum("search", err), http.StatusInternalServerError)
	} else {
		err := json.NewEncoder(w).Encode(res)
		if err != nil {
			serde.Error(
				w,
				serde.WithEnum("search", fmt.Errorf("failed to encode response: %v", err)),
				http.StatusInternalServerError,
			)
		}
	}
}
