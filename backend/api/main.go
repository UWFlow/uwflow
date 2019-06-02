package main

import (
	"log"
	"net/http"

	"github.com/AyushK1/uwflow2.0/backend/api/auth"
	"github.com/AyushK1/uwflow2.0/backend/api/db"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
)

func Routes() *chi.Mux {
	router := chi.NewRouter()
	router.Use(
		middleware.AllowContentType("application/json"),
		middleware.SetHeader("Content-Type", "application/json"),
		middleware.Logger,
		middleware.Recoverer,
	)

	router.Post("/auth/email", auth.AuthenticateEmail)

	return router
}

func main() {
	db.Connect()

	router := Routes()
	log.Fatal(http.ListenAndServe(":8081", router))
}
