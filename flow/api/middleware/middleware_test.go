package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRequireAdminSecret(t *testing.T) {
	const secret = "test-secret"

	tests := []struct {
		name           string
		configured     string
		provided       string
		wantStatusCode int
		wantCalled     bool
	}{
		{
			name: "valid secret", configured: secret, provided: secret,
			wantStatusCode: http.StatusNoContent, wantCalled: true,
		},
		{
			name: "missing secret", configured: secret,
			wantStatusCode: http.StatusUnauthorized,
		},
		{
			name: "incorrect secret", configured: secret, provided: "wrong",
			wantStatusCode: http.StatusUnauthorized,
		},
		{
			name:           "empty server configuration",
			wantStatusCode: http.StatusUnauthorized,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			called := false
			handler := RequireAdminSecret(test.configured)(http.HandlerFunc(
				func(w http.ResponseWriter, _ *http.Request) {
					called = true
					w.WriteHeader(http.StatusNoContent)
				},
			))

			request := httptest.NewRequest(http.MethodPost, "/admin", nil)
			if test.provided != "" {
				request.Header.Set("X-Hasura-Admin-Secret", test.provided)
			}
			response := httptest.NewRecorder()

			handler.ServeHTTP(response, request)

			if response.Code != test.wantStatusCode {
				t.Fatalf("status = %d, want %d", response.Code, test.wantStatusCode)
			}
			if called != test.wantCalled {
				t.Fatalf("downstream called = %t, want %t", called, test.wantCalled)
			}
			if !test.wantCalled && response.Body.String() != "{\"error\":\"unauthorized\"}\n" {
				t.Fatalf("unexpected unauthorized response: %s", response.Body.String())
			}
		})
	}
}
