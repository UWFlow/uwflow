package serde

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
)

type ErrorPayload struct {
	enum string `json:"error"`
}

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
	switch enum {
	case "email":
		return enumErr{err: err, enum: enum}
	case "fb":
		return enumErr{err: fmt.Errorf("authenticating fb: %w", err.Error()), enum: enum}
	case "google":
		return enumErr{err: fmt.Errorf("authenticating google: %w", err.Error()), enum: enum}
	case "forgot_password":
		return enumErr{err: fmt.Errorf("running forgot password flow: %w", err.Error()), enum: enum}
	case "section_notify":
		return enumErr{err: fmt.Errorf("handling section notification request: %w", err.Error()), enum: enum}
	case "transcript":
		return enumErr{err: fmt.Errorf("handling transcript: %w", err.Error()), enum: enum}
	case "schedule":
		return enumErr{err: fmt.Errorf("handling schedule: %w", err.Error()), enum: enum}
	case "webcal":
		return enumErr{err: fmt.Errorf("handling webcal: %w", err.Error()), enum: enum}
	case "search":
		return enumErr{err: fmt.Errorf("handling search: %w", err.Error()), enum: enum}
	default:
		return err
	}
}

func Error(w http.ResponseWriter, err error, status int) {
	log.Printf("API encountered error: %d: %s\n", status, err.Error())

	var enum enumErr
	var payload *ErrorPayload
	if ok := errors.As(err, &enum); ok {
		payload = &ErrorPayload{enum.Enum()}
	} else {
		payload = &ErrorPayload{"unknown_error"}
	}
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}
