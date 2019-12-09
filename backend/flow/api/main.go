package main

import (
	"context"
	"log"
	"net/http"

	"flow/api/auth"
	"flow/api/data"
	"flow/api/env"
	"flow/api/parse"
	"flow/api/serde"
	"flow/api/webcal"
	"flow/common/db"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
)

func SetupRouter(conn *db.Conn) *chi.Mux {
	router := chi.NewRouter()
	router.Use(
		// Reponses are always JSON, but requests may not be (e.g. PDF uploads)
		middleware.SetHeader("Content-Type", "application/json"),
		middleware.Logger,
		middleware.Recoverer,
		middleware.RequestID,
	)

	router.Post("/auth/email/login", serde.WithDbResponse(conn, auth.LoginEmail))
	router.Post("/auth/email/register", serde.WithDbResponse(conn, auth.RegisterEmail))
	router.Post("/auth/facebook/login", serde.WithDbResponse(conn, auth.LoginFacebook))
	router.Post("/auth/google/login", serde.WithDbResponse(conn, auth.LoginGoogle))

	router.Post("/parse/transcript", serde.WithDbResponse(conn, parse.HandleTranscript))
	router.Post("/parse/schedule", serde.WithDbResponse(conn, parse.HandleSchedule))

	router.Post("/auth/forgot-password/send-email", serde.WithDbNoResponse(conn, auth.SendEmail))
	router.Post("/auth/forgot-password/verify", serde.WithDbNoResponse(conn, auth.VerifyResetCode))
	router.Post("/auth/forgot-password/reset", serde.WithDbNoResponse(conn, auth.ResetPassword))

	router.Get("/data/search", serde.WithDbResponse(conn, data.HandleSearch))
	router.Get("/schedule/ical/{userId}", serde.WithDbDirect(conn, webcal.HandleWebcal))

	return router
}

func main() {
	conn, err := db.ConnectPool(context.Background(), env.Global)
	if err != nil {
		log.Fatalf("Error: %s", err)
	}

	router := SetupRouter(conn)
	log.Fatalf("Error: %s", http.ListenAndServe(":"+env.Global.ApiPort, router))
}
