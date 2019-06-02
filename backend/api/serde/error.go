package serde

import (
	"encoding/json"
	"net/http"
)

type ErrorPayload struct {
	Error string `json:"error"`
}

func Error(w http.ResponseWriter, message string, status int) {
	payload := &ErrorPayload{message}
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}
