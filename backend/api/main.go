package main

import (
	"log"
	"net/http"

	"github.com/AyushK1/uwflow2.0/backend/api/auth"
	"github.com/AyushK1/uwflow2.0/backend/api/db"
	"github.com/AyushK1/uwflow2.0/backend/api/parse"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
)

func Routes() *chi.Mux {
	router := chi.NewRouter()
	router.Use(
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

	router := Routes()
	log.Fatal(http.ListenAndServe(":8081", router))
}
