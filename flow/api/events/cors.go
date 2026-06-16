package events

import (
	"net/http"

	"flow/api/env"
)

// allowedOrigins is the production/staging CORS allowlist for the analytics
// ingestion endpoint. In dev mode (RUN_MODE=dev) localhost:3000 is also allowed
// so the local frontend can post events. There is intentionally NO shared
// secret key: a key shipped in browser JS is not secret, so security is
// enforced server-side via this allowlist + the per-IP rate limit.
var allowedOrigins = map[string]bool{
	"https://uwflow.com":      true,
	"https://www.uwflow.com":  true,
	"https://next.uwflow.com": true,
}

// originAllowed reports whether an Origin header value may post events.
func originAllowed(origin string) bool {
	if origin == "" {
		return false
	}
	if allowedOrigins[origin] {
		return true
	}
	// Local development frontend.
	if env.Global.RunMode == "dev" && origin == "http://localhost:3000" {
		return true
	}
	return false
}

// corsMiddleware sets CORS headers for allowed origins and short-circuits the
// preflight OPTIONS request. Disallowed origins simply get no CORS headers
// (the browser then blocks the response), and the request still proceeds —
// server-side validation/rate-limiting is the real gate.
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if originAllowed(origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			w.Header().Set("Access-Control-Max-Age", "86400")
		}

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
