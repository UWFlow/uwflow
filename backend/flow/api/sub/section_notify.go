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

func subscribeToSection(state *state.State, r *http.Request) (error, int) {
	// parse section id from request body
	body := sectionNotifyRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		return fmt.Errorf("decoding subscribe to section request: %v", err), http.StatusBadRequest
	}
	if body.SectionID == nil {
		return fmt.Errorf("decoding subscribe to section request: expected sectionID"), http.StatusBadRequest
	}

	userID, err := serde.UserIdFromRequest(state, r)
	if err != nil {
		return fmt.Errorf("get userId from request: %v", err), http.StatusUnauthorized
	}

	// Check section id is valid and fetch course id
	var courseID int
	err = state.Db.QueryRow(
		`SELECT course_id FROM course_section WHERE id = $1`,
		*body.SectionID,
	).Scan(&courseID)
	if err != nil {
		return fmt.Errorf("fetching course id for given section id: %v", err), http.StatusBadRequest
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
		return fmt.Errorf("checking if already subscribed to course: %v", err), http.StatusInternalServerError
	}

	if !alreadySubscribedToCourse {
		var email string
		err = state.Db.QueryRow(
			`SELECT email FROM public.user WHERE id = $1`, userID,
		).Scan(&email)
		if err != nil {
			return fmt.Errorf("fetching email for given user id: %v", err), http.StatusInternalServerError
		}

		err = SendAutomatedEmail(state, []string{email}, "New Subscription", "Body")
		if err != nil {
			return fmt.Errorf("sending email for initial subscription: %v", err), http.StatusInternalServerError
		}
	}

	// insert into section_subscription table
	_, err = state.Db.Exec(
		"INSERT INTO section_subscription(user_id, section_id) VALUES ($1, $2)",
		userID, *body.SectionID,
	)
	if err != nil {
		return fmt.Errorf("inserting subscription to db: %v", err), http.StatusInternalServerError
	}

	return nil, http.StatusOK
}

func SubscribeToSection(state *state.State, w http.ResponseWriter, r *http.Request) {
	err, status := subscribeToSection(state, r)
	if err != nil {
		serde.Error(w, serde.WithEnum("subscribe_notification", fmt.Errorf("handling subscribe to section request: %v", err)), status)
	}
	w.WriteHeader(status)
}

func unsubscribeToSection(state *state.State, r *http.Request) (error, int) {
	// parse section id from request body
	body := sectionNotifyRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		return fmt.Errorf("decoding unsubscribe to section request: %v", err), http.StatusBadRequest
	}
	if body.SectionID == nil {
		return fmt.Errorf("decoding unsubscribe to section request: expected section id"), http.StatusBadRequest
	}

	userID, err := serde.UserIdFromRequest(state, r)
	if err != nil {
		return fmt.Errorf("fetching user id from request: %v", err), http.StatusUnauthorized
	}

	// delete from section_subscription table
	tag, err := state.Db.Exec(
		"DELETE FROM section_subscription WHERE user_id = $1 AND section_id = $2",
		userID, *body.SectionID,
	)
	if err != nil {
		return fmt.Errorf("deleting subscription from db: %v", err), http.StatusInternalServerError
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("deleting subscription from db: (section id, user id) subscription pair not found"), http.StatusInternalServerError
	}

	return nil, http.StatusOK
}

func UnsubscribeToSection(state *state.State, w http.ResponseWriter, r *http.Request) {
	err, status := unsubscribeToSection(state, r)
	if err != nil {
		serde.Error(w, serde.WithEnum("unsubscribe_notification", fmt.Errorf("handling unsubscribe to section request: %v", err)), status)
	}
	w.WriteHeader(status)
}
