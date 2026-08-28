package middleware

import (
	"fmt"
	"net"
	"net/http"
	"net/url"

	"flow/api/serde"
)

// RejectImpersonation blocks a route for admin impersonation sessions.
//
// The read-only guarantee for impersonation is enforced by Hasura, via the
// `impersonated_user` role's select-only permissions. Handlers in this API,
// however, talk to Postgres directly and never pass through Hasura, so a
// route that writes on behalf of the caller has to opt into this middleware
// or an impersonating admin would be able to modify the account after all.
//
// Requests with no token, or an invalid one, are passed through untouched:
// deciding what to do about those is the handler's job, and it already does
// it. This middleware only ever answers one question — is this a valid token
// that happens to be impersonating.
func RejectImpersonation() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, err := serde.ClaimsFromRequest(r)
			if err == nil && claims.Impersonating() {
				serde.Error(w, r, serde.WithStatus(
					http.StatusForbidden,
					serde.WithEnum(
						serde.ImpersonationForbidden,
						fmt.Errorf("admin %d may not write to user %s while impersonating",
							claims.Impersonator, claims.Hasura.UserId),
					),
				))
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
