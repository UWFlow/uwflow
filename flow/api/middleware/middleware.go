package middleware

import (
	"crypto/subtle"
	"encoding/json"
	"net"
	"net/http"
	"net/url"
)

type authError struct {
	Error string `json:"error"`
}

// RequireAdminSecret protects server-to-server endpoints with the same secret
// used for Hasura administrative requests.
func RequireAdminSecret(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			provided := r.Header.Get("X-Hasura-Admin-Secret")
			valid := secret != "" && provided != "" &&
				subtle.ConstantTimeCompare([]byte(provided), []byte(secret)) == 1
			if !valid {
				w.Header().Set("Content-Type", "application/json")
				w.Header().Set("Cache-Control", "no-store")
				w.WriteHeader(http.StatusUnauthorized)
				_ = json.NewEncoder(w).Encode(authError{Error: "unauthorized"})
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// CORS middleware for localhost environments
func CorsLocalhostMiddleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Extract the host from the origin URL
			if parsedURL, err := url.Parse(r.Header.Get("Origin")); err == nil {
				host, _, err := net.SplitHostPort(parsedURL.Host)
				if err != nil {
					// If SplitHostPort fails, use the original host (no port present)
					host = parsedURL.Host
				}
				if host == "localhost" {
					w.Header().Set("Access-Control-Allow-Origin", r.Header.Get("Origin"))
					w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE")
					w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-CSRF-Token")
					w.Header().Set("Access-Control-Allow-Credentials", "true")
				}
			}

			// Stop here for a Preflighted OPTIONS request.
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
