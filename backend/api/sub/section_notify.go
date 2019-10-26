package sub

import (
	"encoding/json"
	"net/http"

	"github.com/AyushK1/uwflow2.0/backend/api/serde"
	"github.com/AyushK1/uwflow2.0/backend/api/state"
)

type sectionNotifyRequest struct {
	SectionID *int `json:"section_id"`
}

func SubscribeToSection(state *state.State, w http.ResponseWriter, r *http.Request) {
	// parse section id from request body
	body := sectionNotifyRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		serde.Error(w, "Expected non-empty body", http.StatusBadRequest)
		return
	}
	if body.SectionID == nil {
		serde.Error(w, "Expected {section_id}", http.StatusBadRequest)
		return
	}

	userID, err := serde.UserIdFromRequest(state, r)
	if err != nil {
		serde.Error(w, "Authorization failed", http.StatusUnauthorized)
		return
	}

	// Check that key exists in secret.password_reset table
	var sectionExists bool
	err = state.Conn.QueryRow(
		`SELECT EXISTS(SELECT 1 FROM course_section WHERE id = $1)`,
		*body.SectionID,
	).Scan(&sectionExists)
	if err != nil || !sectionExists {
		serde.Error(w, "Provided section id is invalid", http.StatusBadRequest)
		return
	}

	// insert into section_subscriptions table
	_, err = state.Conn.Exec(
		"INSERT INTO section_subscriptions(user_id, section_id) VALUES ($1, $2)",
		userID, *body.SectionID,
	)
	if err != nil {
		serde.Error(w, "Error inserting for user_id", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func UnsubscribeToSection(state *state.State, w http.ResponseWriter, r *http.Request) {
	// parse section id from request body
	body := sectionNotifyRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		serde.Error(w, "Expected non-empty body", http.StatusBadRequest)
		return
	}
	if body.SectionID == nil {
		serde.Error(w, "Expected {section_id}", http.StatusBadRequest)
		return
	}

	userID, err := serde.UserIdFromRequest(state, r)
	if err != nil {
		serde.Error(w, "Authorization failed", http.StatusUnauthorized)
		return
	}

	// insert into section_subscriptions table
	tag, err := state.Conn.Exec(
		"DELETE FROM section_subscriptions WHERE user_id = $1 AND section_id = $2",
		userID, *body.SectionID,
	)
	if err != nil {
		serde.Error(w, "Error unsubscribing", http.StatusInternalServerError)
		return
	}
	if tag.RowsAffected() == 0 {
		serde.Error(w, "Invalid user_id, section_id pair", http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
}
