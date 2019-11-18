package main

import (
	"context"
	"log"
	"net/http"

	"flow/api/auth"
	"flow/api/data"
	"flow/api/parse"
	"flow/api/sub"
	"flow/api/webcal"
	"flow/common/state"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
)

type StatefulHandlerFunc func(*state.State, http.ResponseWriter, *http.Request)

func WithState(s *state.State, handler StatefulHandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Put db connection in request context before entering
		reqState := &state.State{Db: s.Db.With(r.Context()), Env: s.Env, Log: s.Log}
		handler(reqState, w, r)
	}
}

func SetupRouter(state *state.State) *chi.Mux {
	router := chi.NewRouter()
	router.Use(
		// Reponses are always JSON, but requests may not be (e.g. PDF uploads)
		middleware.SetHeader("Content-Type", "application/json"),
		middleware.Logger,
		middleware.Recoverer,
	)

	router.Post("/auth/email/login", WithState(state, auth.AuthenticateEmail))
	router.Post("/auth/email/register", WithState(state, auth.RegisterEmail))
	router.Post("/parse/transcript", WithState(state, parse.HandleTranscript))
	router.Post("/parse/schedule", WithState(state, parse.HandleSchedule))
	router.Post("/auth/google/login", WithState(state, auth.AuthenticateGoogleUser))
	router.Post("/auth/facebook/login", WithState(state, auth.AuthenticateFbUser))
	router.Post("/auth/forgot-password/send-email", WithState(state, auth.SendEmail))
	router.Post("/auth/forgot-password/verify", WithState(state, auth.VerifyResetCode))
	router.Post("/auth/forgot-password/reset", WithState(state, auth.ResetPassword))

	router.Get("/data/search", WithState(state, data.HandleSearch))
	router.Get("/schedule/ical/{userId}", WithState(state, webcal.HandleWebcal))

	router.Post("/section_notify/subscribe", WithState(state, sub.SubscribeToSection))
	router.Post("/section_notify/unsubscribe", WithState(state, sub.UnsubscribeToSection))

	return router
}

func main() {
	ctx := context.Background()
	state, err := state.New(ctx)
	if err != nil {
		log.Fatalf("Failed to initialize: %v", err)
	}

	router := SetupRouter(state)
	log.Fatalf("Server error: %v", http.ListenAndServe(":"+state.Env.ApiPort, router))
}
