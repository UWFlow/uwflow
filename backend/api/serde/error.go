package serde

import (
	"encoding/json"
	"log"
	"net/http"
)

type ErrorPayload struct {
	Error string `json:"error"`
}

func Error(w http.ResponseWriter, message string, status int) {
	// Each error message should be retained in the logs
	log.Printf("API encountered error: %d: %s\n", status, message)
	payload := &ErrorPayload{message}
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}
