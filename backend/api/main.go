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
)

func SetupRouter() *chi.Mux {
	router := chi.NewRouter()
	router.Use(
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

func main() {
	db.Connect()

	router := SetupRouter()
  port := os.Getenv("API_PORT")
	log.Fatal(http.ListenAndServe(":" + port, router))
}
