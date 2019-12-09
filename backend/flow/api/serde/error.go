package serde

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/go-chi/chi/middleware"
)

const (
	EmailNotRegistered   = "email_not_registered"
	EmailTakenByEmail    = "email_taken_by_email"
	EmailTakenByFacebook = "email_taken_by_facebook"
	EmailTakenByGoogle   = "email_taken_by_google"
	EmailWrongPassword   = "email_wrong_password"

  FbNoEmail = "facebook_no_email"

  ResetInvalidKey = "reset_invalid_key"

	ScheduleIsOld = "schedule_old"

	Unknown = "unknown"
)

type enumErr struct {
	err  error
	enum string
}

func (e enumErr) Error() string {
	return e.err.Error()
}

func (e enumErr) Enum() string {
	return e.enum
}

func WithEnum(enum string, err error) error {
	return enumErr{err: err, enum: enum}
}

type statusErr struct {
	err    error
	status int
}

func (e statusErr) Error() string {
	return e.err.Error()
}

func (e statusErr) Status() int {
	return e.status
}

func WithStatus(status int, err error) error {
	return statusErr{err: err, status: status}
}

type errorPayload struct {
	Enum      string `json:"error"`
	RequestId string `json:"request_id"`
}

func Error(w http.ResponseWriter, r *http.Request, err error) {
	var payload errorPayload
	var status int

	payload.RequestId = middleware.GetReqID(r.Context())
	log.Printf("Error in %s: %s", payload.RequestId, err)

	var enum enumErr
	if ok := errors.As(err, &enum); ok {
		payload.Enum = enum.enum
	} else {
		payload.Enum = Unknown
	}

	var st statusErr
	if ok := errors.As(err, &st); ok {
		status = st.status
	} else {
		status = 500
	}

	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}
