package serde

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5/middleware"
)

const (
	//// Common
	// JWT token is expired
	ExpiredJwt = "expired_jwt"

	//// Email registration
	// Email is already taken by another account
	EmailTaken = "email_taken"
	// Email is too short
	EmailTooShort = "email_too_short"
	// Password is too short (this is also emitted by password reset)
	PasswordTooShort = "password_too_short"

	//// Email login
	// There is no user with given email
	EmailNotRegistered = "email_not_registered"
	// There is a user with given email, but the given password is incorrect
	EmailWrongPassword = "email_wrong_password"

	//// Password reset
	// Password reset key is invalid or expired
	InvalidResetKey = "invalid_reset_key"

	//// Schedule import
	// Schedule contains no sections
	EmptySchedule = "empty_schedule"
	// Schedule is for a previous term
	OldSchedule = "old_schedule"

	//// Transcript import
	// Transcript contains no terms
	EmptyTranscript = "empty_transcript"

	//// Fallbacks
	// These do not map exactly to 400 and 500 status codes respectively:
	// - BadRequest represents all otherwise unidentified client errors
	// - InternalError represents all otherwise unidentified server errors
	BadRequest    = "bad_request"
	InternalError = "internal_error"
)

type enumErr struct {
	err  error
	enum string
}

func (e enumErr) Enum() string {
	return e.enum
}

func (e enumErr) Error() string {
	return e.err.Error()
}

func (e enumErr) Unwrap() error {
	return e.err
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

func (e statusErr) Unwrap() error {
	return e.err
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

	var st statusErr
	if ok := errors.As(err, &st); ok {
		status = st.status
	} else {
		status = http.StatusInternalServerError
	}

	var en enumErr
	if ok := errors.As(err, &en); ok {
		payload.Enum = en.enum
	} else {
		if status >= 500 {
			payload.Enum = InternalError
		} else {
			payload.Enum = BadRequest
		}
	}

	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}
