package middleware

import (
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
)

// Request logs route patterns instead of URLs that can contain bearer secrets.
func Request(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		started := time.Now()
		writer := chimiddleware.NewWrapResponseWriter(w, r.ProtoMajor)
		r.Body = http.MaxBytesReader(writer, r.Body, 10<<20)
		next.ServeHTTP(writer, r)
		log.Printf("%s %s status=%d duration=%s", r.Method, chi.RouteContext(r.Context()).RoutePattern(), writer.Status(), time.Since(started))
	})
}
