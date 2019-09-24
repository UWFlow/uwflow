package data

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/AyushK1/uwflow2.0/backend/api/serde"
	"github.com/AyushK1/uwflow2.0/backend/api/state"
)

type Course struct {
	Id            int      `json:"id"`
	Name          string   `json:"name"`
	Code          string   `json:"code"`
	ProfsTeaching []string `json:"profs"`
}

type Prof struct {
	Id      int      `json:"id"`
	Name    string   `json:"name"`
	Courses []string `json:"courses"`
}

type Response struct {
	Courses []Course `json:"courses"`
	Profs   []Prof   `json:"profs"`
}

const CourseQuery = `
SELECT c.id, c.code, c.name, ARRAY_AGG(p.name) FILTER (WHERE p.id IS NOT NULL)
FROM course c
 LEFT JOIN prof_course pc ON pc.course_id = c.id
 LEFT JOIN prof p ON p.id = pc.prof_id
GROUP BY c.id
`

const ProfQuery = `
SELECT p.id, p.name, ARRAY_AGG(c.code) FILTER (WHERE c.id IS NOT NULL)
FROM prof p
 LEFT JOIN prof_course pc ON pc.prof_id = p.id
 LEFT JOIN course c ON c.id = pc.course_id
GROUP BY p.id
`

func dump(state *state.State) (*Response, error) {
	rows, err := state.Conn.Query(CourseQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to query database: %v", err)
	}
	defer rows.Close()

	var response Response
	for rows.Next() {
		var c Course
		err = rows.Scan(&c.Id, &c.Code, &c.Name, &c.ProfsTeaching)
		if err != nil {
			return nil, fmt.Errorf("failed to read rows: %v", err)
		}
		response.Courses = append(response.Courses, c)
	}

	rows, err = state.Conn.Query(ProfQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to query database: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var p Prof
		err = rows.Scan(&p.Id, &p.Name, &p.Courses)
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
		serde.Error(w, err.Error(), http.StatusInternalServerError)
	} else {
		err := json.NewEncoder(w).Encode(res)
		if err != nil {
			serde.Error(
				w,
				fmt.Sprintf("failed to encode response: %v", err),
				http.StatusInternalServerError,
			)
		}
	}
}
