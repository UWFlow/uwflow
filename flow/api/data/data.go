package data

import (
	"encoding/json"
	"fmt"
	"net/http"

	"flow/common/db"

	"github.com/redis/go-redis/v9"
)

var redisClient *redis.Client

func InitRedis(client *redis.Client) {
	redisClient = client
}

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

package data

import (
	"encoding/json"
	"net/http"

	"flow/api/serde"
	"flow/common/db"

	"github.com/redis/go-redis/v9"
)

var redisClient *redis.Client

func InitRedis(client *redis.Client) {
	redisClient = client
}

func HandleSearch(tx *db.Tx, r *http.Request) (interface{}, error) {
	cacheKey := "search_data"

	// Try to get from cache
	cached, err := redisClient.Get(r.Context(), cacheKey).Result()
	if err == nil {
		var response dumpResponse
		if json.Unmarshal([]byte(cached), &response) == nil {
			return &response, nil
		}
	}

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

	// Cache for 1 hour
	jsonData, _ := json.Marshal(response)
	redisClient.Set(r.Context(), cacheKey, jsonData, 3600*1000000000) // 1 hour

	return &response, nil
}
