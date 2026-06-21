package serde

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestErrorIncludesClientDetails(t *testing.T) {
	details := []map[string]string{{"path": "$[0]", "message": "is invalid"}}
	err := WithDetails(
		details,
		WithEnum(
			ValidationFailed,
			WithStatus(http.StatusBadRequest, errors.New("invalid payload")),
		),
	)
	response := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPost, "/admin", nil)

	Error(response, request, err)

	if response.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusBadRequest)
	}
	body := response.Body.String()
	if !strings.Contains(body, `"error":"validation_failed"`) ||
		!strings.Contains(body, `"path":"$[0]"`) {
		t.Fatalf("response does not contain validation details: %s", body)
	}
}

func TestErrorOmitsDetailsForServerErrors(t *testing.T) {
	err := WithDetails("sensitive", errors.New("database failed"))
	response := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPost, "/admin", nil)

	Error(response, request, err)

	if strings.Contains(response.Body.String(), "sensitive") {
		t.Fatalf("server error leaked details: %s", response.Body.String())
	}
}
