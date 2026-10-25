package middleware

import (
	"bytes"
	"io"
	"log"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/go-chi/chi/v5"
)

func TestRequestRedactsSecretsAndLimitsBody(t *testing.T) {
	var logs bytes.Buffer
	old := log.Writer()
	log.SetOutput(&logs)
	defer log.SetOutput(old)
	router := chi.NewRouter()
	router.Use(Request)
	router.Post("/calendar/{secret}", func(w http.ResponseWriter, r *http.Request) {
		if _, err := io.Copy(io.Discard, r.Body); err != nil {
			w.WriteHeader(http.StatusRequestEntityTooLarge)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest("POST", "/calendar/private-token?token=private-query", strings.NewReader(strings.Repeat("x", (10<<20)+1))))
	if recorder.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("status=%d", recorder.Code)
	}
	if strings.Contains(logs.String(), "private-") || !strings.Contains(logs.String(), "/calendar/{secret}") {
		t.Fatalf("unsafe request log: %s", logs.String())
	}
}
