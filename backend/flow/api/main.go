package main

import (
	"context"
	"log"
	"net/http"

	"flow/api/auth"
	"flow/api/data"
	"flow/api/parse"
	"flow/api/webcal"
	"flow/common/db"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
)

type TransactionalHandlerFunc func(*db.Tx, http.ResponseWriter, *http.Request) (interface{}, error)

func WithDb(conn *db.Conn, handler TransactionalHandlerFunc) http.HandlerFunc {
	inner := func(w http.ResponseWriter, r *http.Request) (interface{}, error) {
		tx, err := conn.BeginWithContext(r.Context())
		if err != nil {
			return nil, fmt.Errorf("opening transaction: %w", err)
		}
		defer tx.Rollback()

		resp, err := handler(tx, r)
		if err != nil {
			return nil, err
		}

		err = tx.Commit()
		if err != nil {
			return nil, fmt.Errorf("committing: %w", err)
		}

		return resp, nil
	}

	return func(w http.ResponseWriter, r *http.Request) {
		resp, err := inner(w, r)
		if err != nil {
			serde.Error(w, r, err)
		} else if resp != nil {
			json.NewEncoder(w).Encode(resp)
		}
	}
}

func SetupRouter(conn *db.Conn) *chi.Mux {
	router := chi.NewRouter()
	router.Use(
		// Reponses are always JSON, but requests may not be (e.g. PDF uploads)
		middleware.SetHeader("Content-Type", "application/json"),
		middleware.Logger,
		middleware.Recoverer,
		middleware.RequestID,
	)

	router.Post("/auth/email/login", WithDb(conn, auth.AuthenticateEmail))
	router.Post("/auth/email/register", WithDb(conn, auth.RegisterEmail))
	router.Post("/parse/transcript", WithDb(conn, parse.HandleTranscript))
	router.Post("/parse/schedule", WithDb(conn, parse.HandleSchedule))
	router.Post("/auth/google/login", WithDb(conn, auth.AuthenticateGoogleUser))
	router.Post("/auth/facebook/login", WithDb(conn, auth.AuthenticateFbUser))
	router.Post("/auth/forgot-password/send-email", WithDb(conn, auth.SendEmail))
	router.Post("/auth/forgot-password/verify", WithDb(conn, auth.VerifyResetCode))
	router.Post("/auth/forgot-password/reset", WithDb(conn, auth.ResetPassword))

	router.Get("/data/search", WithDb(conn, data.HandleSearch))
	router.Get("/schedule/ical/{userId}", WithDb(conn, webcal.HandleWebcal))

	return router
}

func main() {
	conn, err := db.ConnectPool(context.Background(), env.Global)
	if err != nil {
		log.Fatalf("Error: %s", err)
	}

	router := SetupRouter(conn)
	log.Fatalf("Error: %v", http.ListenAndServe(":"+env.Global.ApiPort, router))
}
