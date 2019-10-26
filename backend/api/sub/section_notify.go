package sub

import (
	"encoding/json"
	"net/http"

	"github.com/AyushK1/uwflow2.0/backend/api/serde"
	"github.com/AyushK1/uwflow2.0/backend/api/state"
)

type sectionNotifyRequest struct {
	UserID    *int `json:"user_id"`
	SectionID *int `json:"section_id"`
}

func SubscribeToSection(state *state.State, w http.ResponseWriter, r *http.Request) {
	// parse ids from request body
	body := sectionNotifyRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		serde.Error(w, "Expected non-empty body", http.StatusBadRequest)
		return
	}
	if body.UserID == nil || body.SectionID == nil {
		serde.Error(w, "Expected {user_id, section_id}", http.StatusBadRequest)
		return
	}

	// Try to fetch course_id (non-null field)
	var courseID int
	err = state.Conn.QueryRow(
		"SELECT course_id FROM course_section WHERE id = $1",
		body.SectionID,
	).Scan(&courseID)
	if err != nil {
		serde.Error(w, "Invalid section_id provided", http.StatusBadRequest)
		return
	}

	// insert into section_subscriptions table
	_, err = state.Conn.Exec(
		"INSERT INTO section_subscriptions(user_id, course_id, section_id) VALUES ($1, $2, $3)",
		body.UserID, courseID, body.SectionID,
	)
	if err != nil {
		serde.Error(w, "Error inserting for user_id", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func UnsubscribeToSection(state *state.State, w http.ResponseWriter, r *http.Request) {
	// parse ids from request body
	body := sectionNotifyRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		serde.Error(w, "Expected non-empty body", http.StatusBadRequest)
		return
	}
	if body.UserID == nil || body.SectionID == nil {
		serde.Error(w, "Expected {user_id, section_id}", http.StatusBadRequest)
		return
	}

	// insert into section_subscriptions table
	// NOTE: that 200 will be returned even if user_id/section_id are invalid
	// 		 but state will remain unchanged
	_, err = state.Conn.Exec(
		"DELETE FROM section_subscriptions WHERE user_id = $1 AND section_id = $2",
		body.UserID, body.SectionID,
	)
	if err != nil {
		serde.Error(w, "Error unsubscribing", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
