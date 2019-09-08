package main

import (
	"log"
	"net/http"

	"github.com/AyushK1/uwflow2.0/backend/api/auth"
	"github.com/AyushK1/uwflow2.0/backend/api/parse"
	"github.com/AyushK1/uwflow2.0/backend/api/state"

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

	return router
}

func main() {
	state, err := state.Initialize()
	if err != nil {
		log.Fatal("Error: %v", err)
	}

	router := SetupRouter(state)
	log.Fatal("Error: %v", http.ListenAndServe(":"+state.Env.ApiPort, router))
}
