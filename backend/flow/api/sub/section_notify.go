package sub

import (
	"encoding/json"
	"fmt"
	"net/http"

	"flow/api/serde"
	"flow/common/state"
)

type sectionNotifyRequest struct {
	SectionID *int `json:"section_id"`
}

func SubscribeToSection(state *state.State, w http.ResponseWriter, r *http.Request) {
	// parse section id from request body
	body := sectionNotifyRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		serde.Error(w, serde.WithEnum("section_notify", fmt.Errorf("subscribing to section: %w", err.Error())), http.StatusBadRequest)
		return
	}
	if body.SectionID == nil {
		serde.Error(w, serde.WithEnum("section_notify", fmt.Errorf("expected section_id")), http.StatusBadRequest)
		return
	}

	userID, err := serde.UserIdFromRequest(state, r)
	if err != nil {
		serde.Error(w, serde.WithEnum("section_notify", fmt.Errorf("subscribing to section: %w", err.Error())), http.StatusUnauthorized)
		return
	}

	// Check section id is valid and fetch course id
	var courseID int
	err = state.Db.QueryRow(
		`SELECT course_id FROM course_section WHERE id = $1`,
		*body.SectionID,
	).Scan(&courseID)
	if err != nil {
		serde.Error(w, serde.WithEnum("section_notify", fmt.Errorf("subscribing to section: %w", err.Error())), http.StatusBadRequest)
		return
	}

	// Check if already subscribed to course
	var alreadySubscribedToCourse bool
	err = state.Db.QueryRow(
		`SELECT EXISTS(
			SELECT
			FROM section_subscription ss
			  LEFT JOIN course_section cs
				ON ss.section_id = cs.id
			WHERE cs.course_id = $1
		)`, courseID,
	).Scan(&alreadySubscribedToCourse)
	if err != nil {
		serde.Error(w, serde.WithEnum("section_notify", fmt.Errorf("subscribing to section: %w", err.Error())), http.StatusInternalServerError)
		return
	}

	if !alreadySubscribedToCourse {
		var email string
		err = state.Db.QueryRow(
			`SELECT email FROM public.user WHERE id = $1`, userID,
		).Scan(&email)
		if err != nil {
			serde.Error(w, serde.WithEnum("section_notify", fmt.Errorf("subscribing to section: %w", err.Error())), http.StatusInternalServerError)
			return
		}

		err = SendAutomatedEmail(state, []string{email}, "New Subscription", "Body")
		if err != nil {
			serde.Error(w, serde.WithEnum("section_notify", fmt.Errorf("subscribing to section: %w", err.Error())), http.StatusInternalServerError)
		}
	}

	// insert into section_subscription table
	_, err = state.Db.Exec(
		"INSERT INTO section_subscription(user_id, section_id) VALUES ($1, $2)",
		userID, *body.SectionID,
	)
	if err != nil {
		serde.Error(w, serde.WithEnum("section_notify", fmt.Errorf("subscribing to section: %w", err.Error())), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func UnsubscribeToSection(state *state.State, w http.ResponseWriter, r *http.Request) {
	// parse section id from request body
	body := sectionNotifyRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		serde.Error(w, serde.WithEnum("section_notify", fmt.Errorf("unsubscribing to section: %w", err.Error())), http.StatusBadRequest)
		return
	}
	if body.SectionID == nil {
		serde.Error(w, serde.WithEnum("section_notify", fmt.Errorf("unsubscribing to section: expected section_id")), http.StatusBadRequest)
		return
	}

	userID, err := serde.UserIdFromRequest(state, r)
	if err != nil {
		serde.Error(w, serde.WithEnum("section_notify", fmt.Errorf("unsubscribing to section: %w", err.Error())), http.StatusUnauthorized)
		return
	}

	// delete from section_subscription table
	tag, err := state.Db.Exec(
		"DELETE FROM section_subscription WHERE user_id = $1 AND section_id = $2",
		userID, *body.SectionID,
	)
	if err != nil {
		serde.Error(w, serde.WithEnum("section_notify", fmt.Errorf("unsubscribing to section: %w", err.Error())), http.StatusInternalServerError)
		return
	}
	if tag.RowsAffected() == 0 {
		serde.Error(w, serde.WithEnum("section_notify", fmt.Errorf("unsubscribing to section: invalid section_id, user_id pair")), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
}
