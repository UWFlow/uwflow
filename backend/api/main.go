package main

import (
	"log"
	"net/http"
	"os"

	"github.com/AyushK1/uwflow2.0/backend/api/auth"
	"github.com/AyushK1/uwflow2.0/backend/api/db"
	"github.com/AyushK1/uwflow2.0/backend/api/parse"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
)

func SetupRouter() *chi.Mux {
	router := chi.NewRouter()

	cors := cors.New(cors.Options{
		AllowOriginFunc:  AllowOriginFunc,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
	})

	router.Use(
		cors.Handler,
		// Reponses are always JSON, but requests may not be (e.g. PDF uploads)
		middleware.SetHeader("Content-Type", "application/json"),
		middleware.Logger,
		middleware.Recoverer,
	)

	router.Post("/auth/email/login", auth.AuthenticateEmail)
	router.Post("/auth/email/register", auth.RegisterEmail)
	router.Post("/parse/transcript", parse.HandleTranscript)

	return router
}

func AllowOriginFunc(r *http.Request, origin string) bool {
	mode := os.Getenv("API_MODE")

	// Allow frontend to send requests in development mode
	if origin == "http://localhost:3000" && mode == "development" {
		return true
	}

	return false
}

func main() {
	db.Connect()

	router := SetupRouter()
	port := os.Getenv("API_PORT")
	log.Fatal(http.ListenAndServe(":"+port, router))
}
