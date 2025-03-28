package middleware

import "net/http"

// CORS middleware for localhost environments
func CorsLocalhostMiddleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Check if the Origin header is set to a localhost value
			origin := r.Header.Get("Origin")
			if origin == "http://localhost" || origin == "http://localhost:3000" {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE")
				w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-CSRF-Token")
				w.Header().Set("Access-Control-Allow-Credentials", "true")
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