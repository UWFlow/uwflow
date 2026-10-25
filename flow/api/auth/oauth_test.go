package auth

import (
	"context"
	"io"
	"net/http"
	"strings"
	"testing"
)

type providerTransport func(*http.Request) (*http.Response, error)

func (f providerTransport) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }

func TestProviderIdentityValidation(t *testing.T) {
	old := oauthClient
	defer func() { oauthClient = old }()
	for _, provider := range []string{"google", "facebook"} {
		for _, tc := range []struct {
			name, body string
			status     int
			valid      bool
		}{
			{"valid", `{"id":"123"}`, 200, true},
			{"missing ID", `{"email":"someone@example.test"}`, 200, false},
			{"invalid JSON", `{"id":`, 200, false},
			{"provider error", `{"id":"123"}`, 401, false},
		} {
			t.Run(provider+"/"+tc.name, func(t *testing.T) {
				oauthClient = &http.Client{Transport: providerTransport(func(r *http.Request) (*http.Response, error) {
					if r.Header.Get("Authorization") != "Bearer private-test-token" || strings.Contains(r.URL.String(), "private-test-token") {
						t.Fatal("token must only be in authorization header")
					}
					return &http.Response{StatusCode: tc.status, Body: io.NopCloser(strings.NewReader(tc.body)), Header: make(http.Header)}, nil
				})}
				var err error
				if provider == "google" {
					_, err = getGoogleUserInfo(context.Background(), "private-test-token")
				} else {
					_, err = getFacebookUserInfo(context.Background(), "private-test-token")
				}
				if (err == nil) != tc.valid {
					t.Fatalf("err=%v valid=%v", err, tc.valid)
				}
			})
		}
	}
}
