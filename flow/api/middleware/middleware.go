package middleware

import (
	"net"
	"net/http"
	"net/url"
)

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
