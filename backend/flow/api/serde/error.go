package serde

import (
	"encoding/json"
	"errors"
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
	return enumErr{err: err, enum: enum}
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
