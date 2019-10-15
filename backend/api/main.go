package main

import (
	"log"
	"net/http"

	"github.com/AyushK1/uwflow2.0/backend/api/auth"
	"github.com/AyushK1/uwflow2.0/backend/api/data"
	"github.com/AyushK1/uwflow2.0/backend/api/parse"
	"github.com/AyushK1/uwflow2.0/backend/api/state"
	"github.com/AyushK1/uwflow2.0/backend/api/webcal"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
)

type StatefulHandlerFunc func(*state.State, http.ResponseWriter, *http.Request)

func WithState(state *state.State, handler StatefulHandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		handler(state, w, r)
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

	return router
}

func main() {
	state, err := state.Initialize()
	if err != nil {
		log.Fatalf("Error: %v", err)
	}

	router := SetupRouter(state)
	log.Fatalf("Error: %v", http.ListenAndServe(":"+state.Env.ApiPort, router))
}
